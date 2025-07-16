
import React, { useState, useEffect } from "react";
import { Request as RequestEntity } from "@/api/entities";
import { User } from "@/api/entities";
import { Wishlist } from "@/api/entities";
import { ChatRoom } from "@/api/entities"; // Added ChatRoom import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  User as UserIcon,
  MessageCircle,
  ArrowLeft,
  Edit,
  Save,
  X,
  Flag,
  Share2
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function RequestDetailPage() {
  const navigate = useNavigate();
  const requestId = new URLSearchParams(window.location.search).get('id');
  
  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [viewCountUpdated, setViewCountUpdated] = useState(false);

  useEffect(() => {
    loadRequestData();
  }, [requestId]);

  useEffect(() => {
    // 조회수 업데이트는 한 번만 실행
    if (request && !viewCountUpdated && user) {
      updateViewCount();
    }
  }, [request, user, viewCountUpdated]);

  const loadRequestData = async () => {
    if (!requestId) {
      navigate(createPageUrl("Home"));
      return;
    }

    setIsLoading(true);
    try {
      // 사용자 정보 로드
      let currentUser = null;
      try {
        currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        // 로그인하지 않은 경우 무시
      }

      // 요청 정보 로드
      const allRequests = await RequestEntity.list();
      const targetRequest = allRequests.find(r => r.id === requestId);
      
      if (!targetRequest) {
        alert("요청을 찾을 수 없습니다.");
        navigate(createPageUrl("Home"));
        return;
      }

      setRequest(targetRequest);
      setEditedDescription(targetRequest.description || "");

      // 찜 상태 확인 (로그인한 경우만)
      if (currentUser) {
        try {
          const userWishlist = await Wishlist.filter({ 
            user_email: currentUser.email, 
            request_id: requestId 
          });
          setIsWishlisted(userWishlist.length > 0);
        } catch (error) {
          console.error("찜 상태 확인 실패:", error);
        }
      }

    } catch (error) {
      console.error("요청 로드 실패:", error);
      alert("요청 정보를 불러오는데 실패했습니다.");
      navigate(createPageUrl("Home"));
    }
    setIsLoading(false);
  };

  const updateViewCount = async () => {
    try {
      // 자신의 요청이 아닌 경우에만 조회수 증가
      if (user && request && user.email !== request.created_by) {
        await RequestEntity.update(request.id, { 
          view_count: (request.view_count || 0) + 1 
        });
        setViewCountUpdated(true);
      }
    } catch (error) {
      console.error("조회수 업데이트 실패:", error);
      // 조회수 업데이트 실패는 무시 (중요하지 않은 기능)
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (isWishlisted) {
        const userWishlist = await Wishlist.filter({ 
          user_email: user.email, 
          request_id: requestId 
        });
        if (userWishlist.length > 0) {
          await Wishlist.delete(userWishlist[0].id);
          setIsWishlisted(false);
          // 찜 카운트 감소
          try {
            await RequestEntity.update(request.id, { 
              interest_count: Math.max(0, (request.interest_count || 0) - 1)
            });
            setRequest(prev => ({
              ...prev, 
              interest_count: Math.max(0, (prev.interest_count || 0) - 1)
            }));
          } catch (error) {
            console.error("찜 카운트 업데이트 실패:", error);
          }
        }
      } else {
        await Wishlist.create({
          user_email: user.email,
          request_id: requestId
        });
        setIsWishlisted(true);
        // 찜 카운트 증가
        try {
          await RequestEntity.update(request.id, { 
            interest_count: (request.interest_count || 0) + 1
          });
          setRequest(prev => ({
            ...prev, 
            interest_count: (prev.interest_count || 0) + 1
          }));
        } catch (error) {
          console.error("찜 카운트 업데이트 실패:", error);
        }
      }
    } catch (error) {
      console.error("찜하기 실패:", error);
      alert("찜하기에 실패했습니다.");
    }
  };

  const handleEditSave = async () => {
    try {
      await RequestEntity.update(request.id, { description: editedDescription });
      setRequest(prev => ({ ...prev, description: editedDescription }));
      setIsEditing(false);
      alert("설명이 수정되었습니다.");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };
  
  const handleStartChat = async () => {
    try {
      const currentUser = await User.me(); // Get current user info directly
      
      if (currentUser.email === request.created_by) {
        alert("자신의 요청과는 채팅할 수 없습니다.");
        return;
      }

      // Ensure request data is valid before proceeding
      if (!request || !request.id || !request.created_by || !request.product_name) {
          alert("요청 정보가 완전하지 않아 채팅을 시작할 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.");
          return;
      }

      // 기존 채팅방이 있는지 확인
      const existingRooms = await ChatRoom.filter({ 
        request_id: request.id,
        requestor_email: request.created_by,
        traveler_email: currentUser.email
      });
      
      let room;
      if (existingRooms.length > 0) {
        room = existingRooms[0];
      } else {
        // 새 채팅방 생성
        room = await ChatRoom.create({
          request_id: request.id,
          requestor_email: request.created_by,
          traveler_email: currentUser.email,
          product_name: request.product_name,
          last_message: "채팅방이 개설되었습니다.",
          last_message_timestamp: new Date().toISOString()
        });

        // 요청의 채팅 카운트 증가 (새 채팅방이 생성될 때만)
        await RequestEntity.update(request.id, { chat_count: (request.chat_count || 0) + 1 });
        setRequest(prev => ({
          ...prev, 
          chat_count: (prev.chat_count || 0) + 1
        }));
      }
      
      navigate(createPageUrl(`ChatRoom?id=${room.id}`));
      
    } catch (error) {
      console.error("채팅 시작 실패:", error);
      // 로그인 관련 오류는 User.me()에서 발생할 수 있으므로, 더 구체적으로 처리
      if (error.message && error.message.includes("Unauthorized")) { // User.me() could throw 'Unauthorized'
        alert("채팅을 시작하려면 로그인이 필요합니다.");
        User.login();
      } else {
        alert("채팅방을 만드는 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 미정";
    try {
      return format(new Date(dateString), "yyyy년 MM월 dd일", { locale: ko });
    } catch (error) {
      return "날짜 오류";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">요청을 찾을 수 없습니다</h2>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.email === request.created_by;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">구매 요청 상세</h1>
            <p className="text-gray-600">요청 정보를 확인하고 채팅을 시작해보세요</p>
          </div>
        </div>

        <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="h-2 bg-gradient-to-r from-orange-400 to-emerald-400"></div>
          
          {request.image_url && (
            <div className="relative h-64 overflow-hidden">
              <img 
                src={request.image_url} 
                alt={request.product_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {request.product_name}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{request.created_by?.split('@')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(request.created_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>{request.interest_count || 0}</span>
                    <MessageCircle className="w-4 h-4 ml-2" />
                    <span>{request.chat_count || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isOwner && user && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className={`rounded-full ${isWishlisted ? 'text-red-500 border-red-200' : 'text-gray-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                )}
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="w-4 h-4" />
                </Button>
                {!isOwner && (
                  <Button variant="outline" size="icon" className="rounded-full text-red-600">
                    <Flag className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                상세 설명
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-auto"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                )}
              </h3>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="상세 설명을 입력해주세요..."
                    className="min-h-24"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={handleEditSave}>
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {request.description || "상세 설명이 없습니다."}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">구매 희망 국가:</span>
                  <Badge className="bg-blue-100 text-blue-800">{request.country}</Badge>
                </div>
                
                {request.purchase_locations && request.purchase_locations.length > 0 && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">구매 희망 장소:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.purchase_locations.map((location, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">희망 가격:</span>
                  <span className="text-xl font-bold text-green-600">
                    {request.target_price?.toLocaleString()}원
                  </span>
                </div>
                
                {request.service_fee && request.service_fee > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">여행자 수수료:</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {request.service_fee.toLocaleString()}원
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">수량:</span>
                  <span>{request.quantity}개</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">구매 마감일:</span>
                  <span className="font-semibold">
                    {formatDate(request.deadline)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">배송 방식:</span>
                  <Badge variant="outline">{request.delivery_method}</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">연락처:</span>
                  <span className="text-sm text-gray-600">{request.contact_info}</span>
                </div>
                
                {request.negotiable && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <Badge className="bg-yellow-100 text-yellow-800">가격 협상 가능</Badge>
                  </div>
                )}
              </div>
            </div>

            {!isOwner && user && (
              <div className="pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleStartChat} // Changed to handleStartChat
                  className="w-full bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white shadow-lg py-3 text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  채팅하기
                </Button>
              </div>
            )}

            {!user && (
              <div className="pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 mb-4">채팅하려면 로그인이 필요합니다.</p>
                <Button onClick={() => User.login()} className="bg-blue-600 hover:bg-blue-700">
                  로그인
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
