import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { TravelerRequest } from "@/api/entities";
import { Traveler } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShoppingBag, Package, Star, Calendar, MapPin, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function MyTransactionsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myPurchases, setMyPurchases] = useState([]);
  const [mySales, setMySales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // 구매 내역 (내가 요청한 것)
        const purchaseHistory = await RequestEntity.filter(
          { created_by: currentUser.email },
          "-created_date"
        );
        setMyPurchases(purchaseHistory);

        // 판매 내역 (내가 여행자로서 수락한 것)
        const allTravelerRequests = await TravelerRequest.filter(
          { status: "수락" },
          "-created_date"
        );
        
        const myTravels = await Traveler.filter({ created_by: currentUser.email });
        const myTravelIds = myTravels.map(t => t.id);
        
        const mySaleRequests = allTravelerRequests.filter(tr => 
          myTravelIds.includes(tr.traveler_id)
        );
        
        // 각 판매 요청에 대한 구매 요청 정보 가져오기
        const salesWithDetails = await Promise.all(
          mySaleRequests.map(async (saleReq) => {
            const allRequests = await RequestEntity.list();
            const request = allRequests.find(r => r.id === saleReq.request_id);
            return {
              ...saleReq,
              request: request
            };
          })
        );
        
        setMySales(salesWithDetails);
      } catch (error) {
        console.error("거래 내역 로드 실패:", error);
      }
      setIsLoading(false);
    };

    loadTransactions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "거래전":
        return "bg-yellow-100 text-yellow-800";
      case "거래중":
        return "bg-blue-100 text-blue-800";
      case "거래완료":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "거래완료":
        return <Star className="w-4 h-4 text-green-600" />;
      case "거래중":
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("MyProfile"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내 거래</h1>
            <p className="text-gray-600">구매 및 판매 내역을 확인해보세요</p>
          </div>
        </div>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="bg-white shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger value="purchases" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg">
              구매 내역 ({myPurchases.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-lg">
              판매 내역 ({mySales.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <div className="space-y-4">
              {myPurchases.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">구매 내역이 없습니다</h3>
                    <p className="text-gray-500 mb-4">첫 구매 요청을 등록해보세요!</p>
                    <Button onClick={() => navigate(createPageUrl("CreateRequest"))}>
                      구매 요청하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myPurchases.map((purchase) => (
                  <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(purchase.status)}
                          <div>
                            <CardTitle className="text-lg">{purchase.product_name}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {format(new Date(purchase.created_date), "yyyy년 MM월 dd일", { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{purchase.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span>{purchase.target_price?.toLocaleString()}원</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{format(new Date(purchase.deadline), "MM/dd", { locale: ko })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>{purchase.quantity}개</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(createPageUrl(`RequestDetail?id=${purchase.id}`))}
                        >
                          상세 보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="space-y-4">
              {mySales.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">판매 내역이 없습니다</h3>
                    <p className="text-gray-500 mb-4">여행자로 등록하여 구매 요청을 수락해보세요!</p>
                    <Button onClick={() => navigate(createPageUrl("TravelerList"))}>
                      여행자 등록하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mySales.map((sale) => (
                  <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(sale.request?.status)}
                          <div>
                            <CardTitle className="text-lg">{sale.request?.product_name}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {format(new Date(sale.created_date), "yyyy년 MM월 dd일", { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(sale.request?.status)}>
                          {sale.request?.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{sale.request?.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span>{sale.proposed_price?.toLocaleString() || sale.request?.target_price?.toLocaleString()}원</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-400" />
                          <span>{sale.proposed_fee?.toLocaleString() || sale.request?.service_fee?.toLocaleString()}원 수수료</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>{sale.request?.quantity}개</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(createPageUrl(`RequestDetail?id=${sale.request?.id}`))}
                        >
                          상세 보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}