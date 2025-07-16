import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Wishlist } from "@/api/entities";
import { User } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { ChatRoom } from "@/api/entities";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function RequestCard({ request }) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  React.useEffect(() => {
    checkWishlistStatus();
  }, [request.id]);

  const checkWishlistStatus = async () => {
    try {
      const user = await User.me();
      const userWishlist = await Wishlist.filter({ user_email: user.email, request_id: request.id });
      setIsWishlisted(userWishlist.length > 0);
    } catch (error) {
      // User not logged in or other error
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    setWishlistLoading(true);
    
    try {
      const user = await User.me();
      
      if (isWishlisted) {
        const userWishlist = await Wishlist.filter({ user_email: user.email, request_id: request.id });
        if (userWishlist.length > 0) {
          await Wishlist.delete(userWishlist[0].id);
          setIsWishlisted(false);
          await RequestEntity.update(request.id, { 
            interest_count: Math.max(0, (request.interest_count || 0) - 1)
          });
        }
      } else {
        await Wishlist.create({
          user_email: user.email,
          request_id: request.id
        });
        setIsWishlisted(true);
        await RequestEntity.update(request.id, { 
          interest_count: (request.interest_count || 0) + 1
        });
      }
    } catch (error) {
      console.error("찜하기 실패:", error);
      alert("로그인이 필요합니다.");
    }
    setWishlistLoading(false);
  };

  const handleChatClick = async (e) => {
    e.stopPropagation();
    
    try {
      const user = await User.me();
      
      if (user.email === request.created_by) {
        alert("자신과의 채팅은 시작할 수 없습니다.");
        return;
      }

      // 현재 사용자가 traveler인지 requestor인지 확인하여 올바른 채팅방 생성/찾기
      const existingRooms = await ChatRoom.filter({ 
        request_id: request.id
      });
      
      // 현재 사용자가 참여한 채팅방이 있는지 확인
      let chatRoom = existingRooms.find(room => 
        room.requestor_email === user.email || room.traveler_email === user.email
      );
      
      if (!chatRoom) {
        // 새 채팅방 생성 - 현재 사용자를 traveler로 설정
        chatRoom = await ChatRoom.create({
          request_id: request.id,
          requestor_email: request.created_by,
          traveler_email: user.email,
          product_name: request.product_name,
          last_message: "채팅방이 개설되었습니다.",
          last_message_timestamp: new Date().toISOString()
        });
        
        // 채팅 카운트 증가
        await RequestEntity.update(request.id, { 
          chat_count: (request.chat_count || 0) + 1
        });
      }
      
      navigate(createPageUrl(`ChatRoom?id=${chatRoom.id}`));
      
    } catch (error) {
      console.error("채팅 시작 실패:", error);
      alert("로그인이 필요합니다.");
    }
  };

  const handleCardClick = async () => {
    try {
      await RequestEntity.update(request.id, { 
        view_count: (request.view_count || 0) + 1
      });
    } catch (error) {
      console.error("조회수 업데이트 실패:", error);
    }
    
    navigate(createPageUrl(`RequestDetail?id=${request.id}`));
  };

  const isUrgent = request.deadline && new Date(request.deadline) - new Date() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm hover:-translate-y-2 hover:scale-105">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
          <img
            src={request.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={request.product_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isUrgent && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" />
              긴급
            </div>
          )}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110"
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${
              isWishlisted ? 'text-red-500 fill-current scale-110' : 'text-gray-600 hover:text-red-500'
            }`} />
          </button>
        </div>
        <CardContent className="p-3 space-y-2">
          <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight min-h-[2rem] group-hover:text-orange-600 transition-colors">
            {request.product_name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{request.country}</span>
          </div>
          <p className="font-bold text-base text-gray-900 group-hover:text-orange-600 transition-colors">
            {request.target_price?.toLocaleString('ko-KR')}원
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {request.interest_count || 0}
              </span>
              <button 
                onClick={handleChatClick}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                채팅
              </button>
            </div>
            {request.deadline && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                ~{format(new Date(request.deadline), "MM/dd")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}