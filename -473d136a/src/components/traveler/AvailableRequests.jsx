
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  MessageCircle,
  ShoppingBag,
  Clock,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChatRoom } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { User as UserEntity } from "@/api/entities"; // Renamed to avoid conflict with Lucide icon
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const countryColors = {
  "미국": "bg-blue-100 text-blue-800 border-blue-200",
  "일본": "bg-red-100 text-red-800 border-red-200",
  "유럽": "bg-purple-100 text-purple-800 border-purple-200",
  "중국": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "동남아": "bg-green-100 text-green-800 border-green-200",
  "기타": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function AvailableRequests({ requests, userTravels, onRefresh }) {
  const navigate = useNavigate();

  const handleChat = async (request) => {
     try {
      const user = await UserEntity.me(); // Use UserEntity for the entity
      if (user.email === request.created_by) {
        alert("자신과의 채팅은 시작할 수 없습니다.");
        return;
      }

      const existingRoom1 = await ChatRoom.filter({ request_id: request.id, traveler_email: user.email });
      if (existingRoom1.length > 0) {
        navigate(createPageUrl(`ChatRoom?id=${existingRoom1[0].id}`));
        return;
      }
      
      const newRoom = await ChatRoom.create({
        request_id: request.id,
        requestor_email: request.created_by,
        traveler_email: user.email,
        product_name: request.product_name,
        last_message: "채팅방이 개설되었습니다."
      });
      
      await RequestEntity.update(request.id, { chat_count: (request.chat_count || 0) + 1 });
      
      navigate(createPageUrl(`ChatRoom?id=${newRoom.id}`));

    } catch (error) {
      console.error("채팅 시작 실패:", error);
      alert("채팅을 시작하려면 로그인이 필요합니다.");
    }
  };

  const canMatchRequest = (request) => {
    if (!request.deadline) return false;
    return userTravels.some(travel => 
      travel.country === request.country &&
      travel.departure_date && new Date(travel.departure_date) <= new Date(request.deadline) &&
      travel.return_date && new Date(travel.return_date) >= new Date()
    );
  };

  const isUrgent = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) - new Date() < 7 * 24 * 60 * 60 * 1000;
  };

  if (requests.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">매칭 가능한 요청이 없습니다</h3>
          <p className="text-gray-500">새로운 구매 요청을 기다려주세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => {
        const canMatch = canMatchRequest(request);
        const urgent = isUrgent(request.deadline);
        
        return (
          <Card key={request.id} className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 ${canMatch ? 'ring-2 ring-teal-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                  {request.product_name}
                </h3>
                {urgent && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse ml-2">
                    <Clock className="w-3 h-3 mr-1" />
                    급함
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${countryColors[request.country]} border text-xs`}>
                  <MapPin className="w-3 h-3 mr-1" />
                  {request.country}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  {request.quantity}개
                </Badge>
                {canMatch && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    매칭 가능
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {request.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={request.image_url} 
                    alt={request.product_name}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {request.description || "상세 설명이 없습니다."}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">희망 가격</span>
                  <span className="font-bold text-lg text-orange-600">
                    {request.target_price?.toLocaleString()}원
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">마감일</span>
                  <span className="text-sm font-medium text-gray-700">
                    {request.deadline ? format(new Date(request.deadline), "MM월 dd일", { locale: ko }) : '마감일 미정'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">배송 방식</span>
                  <span className="text-sm font-medium text-gray-700">
                    {request.delivery_method}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  {request.created_date ? `${format(new Date(request.created_date), "MM/dd", { locale: ko })} 등록` : '등록일 미정'}
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleChat(request)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium ${
                    canMatch 
                      ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  채팅하기
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
