import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Plane, 
  CheckCircle, 
  DollarSign,
  TrendingUp 
} from "lucide-react";

export default function StatsOverview({ stats }) {
  const statsCards = [
    {
      title: "총 구매 요청",
      value: stats.totalRequests,
      icon: ShoppingBag,
      color: "bg-blue-500",
      change: "+12%"
    },
    {
      title: "등록된 여행자",
      value: stats.totalTravelers,
      icon: Plane,
      color: "bg-green-500",
      change: "+8%"
    },
    {
      title: "활성 요청",
      value: stats.activeRequests,
      icon: CheckCircle,
      color: "bg-orange-500",
      change: "+5%"
    },
    {
      title: "총 거래 가치",
      value: `${(stats.totalValue / 10000).toFixed(0)}만원`,
      icon: DollarSign,
      color: "bg-purple-500",
      change: "+24%"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}