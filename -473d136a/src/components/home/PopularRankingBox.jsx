import React, { useState, useEffect } from "react";
import { Request } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageSquare,
  Crown,
  Flame
} from "lucide-react";

export default function PopularRankingBox() {
  const [popularRequests, setPopularRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPopularRequests();
  }, []);

  const loadPopularRequests = async () => {
    try {
      const requests = await Request.list("-view_count", 5);
      // 인기도 점수 계산 (조회수 + 관심수*2 + 채팅수*3)
      const scored = requests.map(req => ({
        ...req,
        popularity_score: (req.view_count || 0) + (req.interest_count || 0) * 2 + (req.chat_count || 0) * 3
      }));
      scored.sort((a, b) => b.popularity_score - a.popularity_score);
      setPopularRequests(scored.slice(0, 5));
    } catch (error) {
      console.error("인기 요청 로드 실패:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-100/50 to-emerald-100/50 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-white/50 rounded-xl"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-100/50 to-emerald-100/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          실시간 인기 요청
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {popularRequests.map((request, index) => (
            <div 
              key={request.id} 
              className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-200 group cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {index === 0 && <Crown className="w-4 h-4" />}
                {index > 0 && index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                  {request.product_name}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {request.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {request.interest_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {request.chat_count || 0}
                  </span>
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white border-0 text-xs">
                🔥 HOT
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}