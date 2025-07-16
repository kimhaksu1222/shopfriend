
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { ChatRoom as ChatRoomEntity } from "@/api/entities";
import { ChatMessage } from "@/api/entities";
import { Report } from "@/api/entities";
import { Review } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  LogOut,
  AlertTriangle,
  Award,
  Star,
  Flag,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from 'date-fns'; // Added 'format'
import { ko } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ChatRoomPage() {
  const navigate = useNavigate();
  const chatRoomId = new URLSearchParams(window.location.search).get('id');

  const [currentUser, setCurrentUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("거래전");
  const [aiStatusMessage, setAiStatusMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // Added for error messages

  const [reportData, setReportData] = useState({
    reason: "",
    description: ""
  });

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ""
  });

  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadInitialData();
    return () => {
      // 컴포넌트 언마운트 시 폴링 정리
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [chatRoomId]);

  useEffect(() => {
    // 메시지가 추가될 때만 스크롤 (AI 분석 등으로 인한 불필요한 스크롤 방지)
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // 실시간 메시지 폴링 설정
  useEffect(() => {
    if (isPollingEnabled && currentUser && chatRoomId) {
      pollingIntervalRef.current = setInterval(() => {
        fetchNewMessages();
      }, 3000); // 3초마다 새 메시지 확인

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [chatRoomId, currentUser, isPollingEnabled]);

  // AI 분석을 실시간으로 수행
  useEffect(() => {
    if (messages.length >= 3 && messages.length % 3 === 0) { // 3개 메시지마다 분석
      analyzeTransactionStatus(messages);
    }
  }, [messages.length]); // 메시지 개수 변화 시 실시간 AI 분석

  // 브라우저 visibility 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨지면 폴링 중지
        setIsPollingEnabled(false);
      } else {
        // 페이지가 다시 보이면 폴링 재시작
        setIsPollingEnabled(true);
        // 즉시 새 메시지 확인
        fetchNewMessages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const loadInitialData = async () => {
    if (!chatRoomId) {
      navigate(createPageUrl("ChatList"));
      return;
    }

    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // 특정 채팅방만 효율적으로 불러오도록 수정
      const matchingRooms = await ChatRoomEntity.filter({ id: chatRoomId });
      if (!matchingRooms || matchingRooms.length === 0) {
        throw new Error("채팅방을 찾을 수 없습니다.");
      }
      const currentRoom = matchingRooms[0];
      setRoom(currentRoom);

      const [requestData, messagesData, reviewsData] = await Promise.all([
        currentRoom.request_id ? RequestEntity.filter({ id: currentRoom.request_id }).then(res => res[0]) : Promise.resolve(null),
        ChatMessage.filter({ chat_room_id: chatRoomId }, "created_date"),
        Review.filter({ chat_room_id: chatRoomId, reviewer_email: user.email })
      ]);

      if (!requestData) {
        console.warn("연결된 구매 요청을 찾을 수 없어 기본값을 사용합니다.");
        const fallbackRequest = {
          id: currentRoom.request_id || "unknown",
          product_name: currentRoom.product_name || "알 수 없는 상품",
          status: "거래전",
          target_price: 0,
          country: "알 수 없음",
          created_by: currentRoom.requestor_email
        };
        setRequest(fallbackRequest);
        setTransactionStatus(fallbackRequest.status);
      } else {
        setRequest(requestData);
        setTransactionStatus(requestData.status);
      }

      setMessages(messagesData);

      // 마지막 메시지 타임스탬프 설정
      if (messagesData.length > 0) {
        setLastMessageTimestamp(messagesData[messagesData.length - 1].created_date);
      }

      if (reviewsData.length > 0) {
        setReviewSubmitted(true);
      }

      const otherUserEmail = user.email === currentRoom.requestor_email ? currentRoom.traveler_email : currentRoom.requestor_email;
      const otherUserData = await User.filter({ email: otherUserEmail });
      setOtherUser(otherUserData.length > 0 ? otherUserData[0] : { email: otherUserEmail });

      // AI 상태 분석 (새 메시지 포함)
      if (messagesData.length > 0) {
        analyzeTransactionStatus(messagesData);
      }

    } catch (error) {
      console.error("채팅방 로드 실패:", error);
      if (error.message.includes("429")) {
        alert("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert("채팅방을 불러오는데 실패했습니다. 채팅 목록으로 돌아갑니다.");
      }
      navigate(createPageUrl("ChatList"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewMessages = async () => {
    if (!chatRoomId || !currentUser || !isPollingEnabled) return;

    try {
      // 더 효율적인 메시지 조회 (최근 메시지만)
      const allMessages = await ChatMessage.filter({ chat_room_id: chatRoomId }, "created_date");

      // 새 메시지가 있는지 확인
      const hasNewMessages = allMessages.length > messages.length;

      if (hasNewMessages) {
        const oldLength = messages.length;
        setMessages(allMessages);

        if (allMessages.length > 0) {
          setLastMessageTimestamp(allMessages[allMessages.length - 1].created_date);
        }

        // 상대방이 보낸 새 메시지에 대한 알림 생성
        const newMessages = allMessages.slice(oldLength);
        const otherUserMessages = newMessages.filter(msg => msg.sender_email !== currentUser.email);

        if (otherUserMessages.length > 0) {
          // 브라우저 알림 표시
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("새 메시지", {
              body: `${otherUser?.nickname || otherUser?.full_name || otherUser?.email}: ${otherUserMessages[otherUserMessages.length - 1].content}`,
              icon: "/favicon.ico"
            });
          }
        }

        // 읽음 처리
        const unreadMessages = allMessages.filter(
          (msg) => msg.sender_email !== currentUser.email && !msg.is_read
        );

        if (unreadMessages.length > 0) {
          Promise.all(
            unreadMessages.map(msg => ChatMessage.update(msg.id, { is_read: true }))
          ).catch(error => {
            console.error("읽음 처리 실패:", error);
          });
        }
      }
    } catch (error) {
      console.error("새 메시지 로드 실패:", error);

      // Rate limit 오류 시 폴링 간격 조정
      if (error.message.includes("429")) {
        setIsPollingEnabled(false);
        setTimeout(() => {
          setIsPollingEnabled(true);
        }, 10000); // 10초 후 재시작
      }
    }
  };

  const analyzeTransactionStatus = async (messageList) => {
    if (messageList.length < 3) return; // 메시지가 너무 적으면 분석하지 않음

    setIsAnalyzing(true);
    try {
      const recentMessages = messageList.slice(-10).map(m => `${m.sender_nickname || m.sender_email}: ${m.content}`).join('\n');

      const prompt = `
        다음은 구매 요청 채팅 대화입니다:
        ${recentMessages}

        이 대화를 분석해서 거래 상태를 판단해주세요.
        응답은 반드시 JSON 형식으로: {"status": "거래전|거래중|거래완료", "message": "상태 설명"}

        판단 기준:
        - 거래전: 아직 구매 합의가 이루어지지 않음
        - 거래중: 구매가 합의되고 진행 중
        - 거래완료: 상품 전달이 완료됨
      `;

      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["거래전", "거래중", "거래완료"] },
            message: { type: "string" }
          },
          required: ["status", "message"]
        }
      });

      if (result.status !== transactionStatus) {
        setTransactionStatus(result.status);
        setAiStatusMessage(result.message);

        // 요청 상태도 업데이트 (요청이 유효할 경우에만 시도)
        if (request && request.id && request.id !== "unknown") {
          try {
            await RequestEntity.update(request.id, { status: result.status });
          } catch (updateError) {
            // 요청이 삭제되었을 수 있으므로 오류는 콘솔에만 기록하고 사용자에게는 알리지 않음
            console.error(`Request update failed, it might have been deleted. ID: ${request.id}`, updateError);
          }
        }
      }

    } catch (error) {
      console.error("AI 분석 실패:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !room) return;

    setIsSending(true);
    setErrorMessage(""); // Clear previous errors

    const tempMessage = {
      id: `temp-${Date.now()}`,
      chat_room_id: chatRoomId,
      sender_email: currentUser.email,
      sender_nickname: currentUser.nickname || currentUser.full_name,
      content: newMessage.trim(),
      created_date: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const createdMessage = await ChatMessage.create({
        chat_room_id: chatRoomId,
        sender_email: tempMessage.sender_email,
        sender_nickname: currentUser.nickname || currentUser.full_name, // Added nickname
        content: tempMessage.content
      });

      // 임시 메시지를 실제 메시지로 교체
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? createdMessage : m));
      setLastMessageTimestamp(createdMessage.created_date);

      await ChatRoomEntity.update(room.id, {
        last_message: tempMessage.content,
        last_message_timestamp: createdMessage.created_date,
      });

      // AI 분석은 messages state가 업데이트되면서 useEffect에 의해 자동으로 트리거됨
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      // 실패 시 임시 메시지 제거
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setErrorMessage("메시지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReport = async () => {
    if (!reportData.reason || !reportData.description) {
      alert("신고 사유와 상세 내용을 모두 입력해주세요.");
      return;
    }

    try {
      await Report.create({
        reported_type: "채팅방",
        reported_id: chatRoomId,
        reason: reportData.reason,
        description: reportData.description
      });

      alert("신고가 접수되었습니다.");
      setShowReport(false);
      setReportData({ reason: "", description: "" });
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고 접수에 실패했습니다.");
    }
  };

  const handleReview = async () => {
    if (!reviewData.rating || !reviewData.comment) {
      alert("별점과 후기를 모두 입력해주세요.");
      return;
    }

    try {
      await Review.create({
        chat_room_id: chatRoomId,
        request_id: request.id,
        reviewer_email: currentUser.email,
        reviewee_email: otherUser.email,
        rating: reviewData.rating,
        comment: reviewData.comment,
        transaction_type: currentUser.email === room.requestor_email ? "구매자" : "여행자"
      });

      alert("후기가 등록되었습니다.");
      setShowReview(false);
      setReviewSubmitted(true);
    } catch (error) {
      console.error("후기 등록 실패:", error);
      alert("후기 등록에 실패했습니다.");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await ChatRoomEntity.delete(chatRoomId);
      navigate(createPageUrl("ChatList"));
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
      alert("채팅방 나가기에 실패했습니다.");
    }
  };

  const formatMessageTime = (timestamp) => {
    try {
      const now = new Date();
      const messageTime = new Date(timestamp);
      
      // 유효하지 않은 날짜 처리
      if (isNaN(messageTime.getTime())) {
        return '시간 정보 없음';
      }
      
      const diffInSeconds = Math.floor((now - messageTime) / 1000);
      
      if (diffInSeconds < 10) {
        return '방금 전';
      } else if (diffInSeconds < 60) {
        return `${diffInSeconds}초 전`;
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}분 전`;
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}시간 전`;
      } else {
        return format(messageTime, "MM/dd HH:mm", { locale: ko });
      }
    } catch (error) {
      console.error("시간 포맷 오류:", error);
      return '시간 정보 오류';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("ChatList"))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900">
              {request?.product_name || "채팅"}
            </h1>
            <p className="text-sm text-gray-500">{otherUser?.nickname || otherUser?.full_name || otherUser?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI 상태 표시 */}
          {isAnalyzing && (
            <div className="flex items-center gap-1 text-blue-600">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs">분석중...</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowReport(true)}>
                <Flag className="w-4 h-4 mr-2" />
                신고하기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLeaveAlert(true)} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                채팅방 나가기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* AI 상태 알림 */}
      {transactionStatus !== "거래전" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {transactionStatus === "거래중" && "거래가 진행 중입니다"}
                {transactionStatus === "거래완료" && "거래가 완료되었습니다"}
              </span>
            </div>
            {transactionStatus === "거래완료" && !reviewSubmitted && (
              <Button
                size="sm"
                onClick={() => setShowReview(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Star className="w-4 h-4 mr-1" />
                후기 남기기
              </Button>
            )}
          </div>
          {aiStatusMessage && (
            <p className="text-sm text-blue-700 mt-1">{aiStatusMessage}</p>
          )}
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isMyMessage = message.sender_email === currentUser?.email;
          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
                {!isMyMessage && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherUser?.profile_picture_url} /> {/* Assuming otherUser has profile_picture_url */}
                    <AvatarFallback>{otherUser?.nickname?.charAt(0) || otherUser?.full_name?.charAt(0) || otherUser?.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words ${
                    isMyMessage
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs font-bold text-orange-600 mb-1">{message.sender_nickname || message.sender_email.split('@')[0]}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMyMessage
                        ? 'text-orange-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.created_date)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="bg-white border-t p-4">
        {errorMessage && (
          <p className="text-red-500 text-sm mb-2 text-center">{errorMessage}</p>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />
          <Button type="submit" disabled={isSending} className="bg-orange-500 hover:bg-orange-600">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {/* 신고 다이얼로그 */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>신고하기</DialogTitle>
            <DialogDescription>신고 사유를 선택하고 상세 내용을 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">신고 사유</label>
              <Select value={reportData.reason} onValueChange={(value) => setReportData({...reportData, reason: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="신고 사유를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="스팸">스팸</SelectItem>
                  <SelectItem value="사기">사기</SelectItem>
                  <SelectItem value="부적절한내용">부적절한 내용</SelectItem>
                  <SelectItem value="욕설">욕설</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">상세 내용</label>
              <Textarea
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                placeholder="신고 내용을 자세히 설명해주세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>취소</Button>
            <Button onClick={handleReport} className="bg-red-600 hover:bg-red-700">신고하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 후기 다이얼로그 */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거래 후기 남기기</DialogTitle>
            <DialogDescription>거래 경험을 다른 사용자들과 공유해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">별점</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`p-1 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">후기</label>
              <Textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                placeholder="거래 경험을 자세히 설명해주세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(false)}>취소</Button>
            <Button onClick={handleReview} className="bg-orange-500 hover:bg-orange-600">후기 등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 채팅방 나가기 확인 */}
      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>채팅방 나가기</AlertDialogTitle>
            <AlertDialogDescription>
              채팅방을 나가면 모든 대화 내용이 삭제됩니다. 정말 나가시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveRoom} className="bg-red-600 hover:bg-red-700">
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
