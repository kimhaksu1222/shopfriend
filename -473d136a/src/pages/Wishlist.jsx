
import React, { useState, useEffect } from "react";
import { Wishlist } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Package, MessageCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const userWishlist = await Wishlist.filter({ user_email: currentUser.email });
      setWishlistItems(userWishlist);

      if (userWishlist.length > 0) {
        const requestIds = userWishlist.map(w => w.request_id);
        const allRequests = await RequestEntity.list();
        const wishlistRequests = allRequests.filter(r => requestIds.includes(r.id));
        setRequests(wishlistRequests);
      }
    } catch (error) {
      console.error("찜 목록 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const handleRemoveWishlist = async (requestId) => {
    try {
      const wishlistItem = wishlistItems.find(w => w.request_id === requestId);
      if (wishlistItem) {
        await Wishlist.delete(wishlistItem.id);
        setWishlistItems(prev => prev.filter(w => w.request_id !== requestId));
        setRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error("찜 삭제 실패:", error);
      alert("찜 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">찜한 상품</h1>
            <p className="text-gray-600">관심있는 상품들을 모아보세요</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">찜한 상품이 없어요</h3>
            <p className="text-gray-500 mb-6">마음에 드는 상품을 찜해보세요!</p>
            <Button 
              onClick={() => navigate(createPageUrl("Home"))}
              style={{backgroundColor: 'var(--carrot-orange)'}}
              className="text-white px-6 py-2 rounded-lg"
            >
              상품 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border group">
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  <img
                    src={request.image_url || 'https://via.placeholder.com/300'}
                    alt={request.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => navigate(createPageUrl(`RequestDetail?id=${request.id}`))}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full"
                    onClick={() => handleRemoveWishlist(request.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-3 space-y-2">
                  <h3 
                    className="font-medium text-gray-800 truncate leading-snug cursor-pointer hover:text-orange-500"
                    onClick={() => navigate(createPageUrl(`RequestDetail?id=${request.id}`))}
                  >
                    {request.product_name}
                  </h3>
                  <p className="font-bold text-lg text-gray-900">
                    {request.target_price?.toLocaleString()}원
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{request.country}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {request.interest_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {request.chat_count || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
