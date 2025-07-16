
import React, { useState, useEffect } from "react";
import { TravelerRequest } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { Notification } from "@/api/entities";
import { ChatRoom } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, Check, X, User, ShoppingBag, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ReceivedRequests({ requests, onRefresh }) {
  const navigate = useNavigate();
  const [requestDetails, setRequestDetails] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      const details = {};
      const allRequests = await RequestEntity.list();
      for (const req of requests) {
        details[req.request_id] = allRequests.find(r => r.id === req.request_id);
      }
      setRequestDetails(details);
    };

    if (requests.length > 0) {
      fetchDetails();
    }
  }, [requests]);

  const handleResponse = async (travelerRequestId, request_id, requester_email, response) => {
    const status = response === 'accept' ? '수락' : '거절';
    const requestStatus = response === 'accept' ? '거래중' : '거래전';
    
    try {
      await TravelerRequest.update(travelerRequestId, { status });
      
      if(response === 'accept') {
        await RequestEntity.update(request_id, { status: requestStatus });
      }

      await Notification.create({
        type: '여행자요청',
        title: `당신의 요청이 ${status}되었습니다.`,
        message: `[${requestDetails[request_id]?.product_name}]에 대한 요청이 ${status}되었습니다.`,
        recipient_email: requester_email,
        related_id: request_id,
        action_url: createPageUrl(`RequestDetail?id=${request_id}`)
      });

      onRefresh();
      alert(`요청이 ${status}되었습니다.`);
    } catch (error) {
      console.error("요청 처리 실패:", error);
      alert("요청 처리에 실패했습니다.");
    }
  };

  const handleCancel = async (travelerRequestId, request_id, requester_email) => {
    if (window.confirm("정말로 취소하시겠습니까?")) {
      try {
        await TravelerRequest.update(travelerRequestId, { status: '거절' });
        await RequestEntity.update(request_id, { status: '거래전' });

        await Notification.create({
          type: '여행자요청',
          title: '거래가 취소되었습니다.',
          message: `[${requestDetails[request_id]?.product_name}] 거래가 취소되었습니다.`,
          recipient_email: requester_email,
          related_id: request_id,
          action_url: createPageUrl(`RequestDetail?id=${request_id}`)
        });

        onRefresh();
        alert("거래가 취소되었습니다.");
      } catch (error) {
        console.error("취소 실패:", error);
        alert("취소에 실패했습니다.");
      }
    }
  };

  const handleStartChat = async (request_id, requester_email) => {
    try {
      const user = await UserEntity.me();
      // 채팅방이 이미 있는지 확인
      const existingRooms = await ChatRoom.filter({ request_id: request_id, traveler_email: user.email });
      let room;
      
      if (existingRooms.length > 0) {
        room = existingRooms[0];
      } else {
        // 새 채팅방 생성
        room =await ChatRoom.create({
          request_id: request_id,
          requestor_email: requester_email,
          traveler_email: user.email, // "current_user_email"에서 실제 사용자 이메일로 수정
          product_name: requestDetails[request_id]?.product_name,
          last_message: "채팅방이 개설되었습니다.",
          last_message_timestamp: new Date().toISOString()
        });
      }
      
      navigate(createPageUrl(`ChatRoom?id=${room.id}`));
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  if (requests.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">받은 요청이 없습니다</h3>
          <p className="text-gray-500">새로운 요청을 기다려보세요!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <Card key={req.id} className="bg-white/80 backdrop-blur-sm shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                   <ShoppingBag className="w-5 h-5 text-teal-600" />
                   <p className="font-semibold text-gray-800">{requestDetails[req.request_id]?.product_name || '로딩 중...'}</p>
                   <Badge variant="outline">{req.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{req.requester_email}</span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">{req.message}</p>
              </div>
              
              <div className="flex gap-2 self-end md:self-center">
                {req.status === '대기중' && (
                  <>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleResponse(req.id, req.request_id, req.requester_email, 'accept')}>
                      <Check className="w-4 h-4 mr-1" /> 수락
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleResponse(req.id, req.request_id, req.requester_email, 'decline')}>
                      <X className="w-4 h-4 mr-1" /> 거절
                    </Button>
                  </>
                )}
                
                {req.status === '수락' && (
                  <>
                    <Button size="sm" onClick={() => handleStartChat(req.request_id, req.requester_email)} className="bg-blue-500 hover:bg-blue-600">
                      <MessageSquare className="w-4 h-4 mr-1" /> 채팅하기
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(req.id, req.request_id, req.requester_email)}>
                      취소
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
