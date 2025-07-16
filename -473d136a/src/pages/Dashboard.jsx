
import React, { useState, useEffect } from "react";
import { Request as RequestEntity } from "@/api/entities";
import { Traveler } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Plane,
  DollarSign,
  Calendar,
  MapPin,
  Package
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import StatsOverview from "../components/dashboard/StatsOverview";
import RequestsByCountry from "../components/dashboard/RequestsByCountry";
import RecentActivity from "../components/dashboard/RecentActivity";

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [travelers, setTravelers] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, travelersData, currentUser] = await Promise.all([
        RequestEntity.list("-created_date"),
        Traveler.list("-created_date"),
        User.me().catch(() => null)
      ]);
      
      setRequests(requestsData);
      setTravelers(travelersData);
      setUser(currentUser);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const getStats = () => {
    const totalRequests = requests.length;
    const totalTravelers = travelers.length;
    const activeRequests = requests.filter(r => r.status === "대기중").length;
    const completedRequests = requests.filter(r => r.status === "완료").length;
    const totalValue = requests.reduce((sum, r) => sum + (r.target_price || 0), 0);
    
    return {
      totalRequests,
      totalTravelers,
      activeRequests,
      completedRequests,
      totalValue
    };
  };

  const getRequestsByCountry = () => {
    const countryStats = {};
    requests.forEach(request => {
      countryStats[request.country] = (countryStats[request.country] || 0) + 1;
    });
    
    return Object.entries(countryStats).map(([country, count]) => ({
      country,
      count
    }));
  };

  const getMonthlyTrends = () => {
    const monthlyData = {};
    requests.forEach(request => {
      const month = new Date(request.created_date).toLocaleString('ko-KR', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .slice(-6)
      .map(([month, count]) => ({ month, requests: count }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded-xl"></div>
              <div className="h-80 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const countryData = getRequestsByCountry();
  const monthlyData = getMonthlyTrends();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600">숍프렌드 서비스 현황을 한눈에 확인하세요</p>
          </div>
        </div>

        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                월별 요청 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <RequestsByCountry data={countryData} />
        </div>

        <RecentActivity requests={requests.slice(0, 10)} />
      </div>
    </div>
  );
}
