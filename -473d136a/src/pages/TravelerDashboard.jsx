
import React, { useState, useEffect } from "react";
import { Traveler } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities"; // Changed from Request to Request as RequestEntity
import { TravelerRequest } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Plus, 
  Package, 
  Star,
  Inbox,
  ArrowLeft,
  Trash2,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TravelerForm from "../components/traveler/TravelerForm";
import AvailableRequests from "../components/traveler/AvailableRequests";
import MyTravels from "../components/traveler/MyTravels";
import ReceivedRequests from "../components/traveler/ReceivedRequests";

export default function TravelerDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myTravels, setMyTravels] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTravel, setEditingTravel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const travels = await Traveler.filter({ created_by: currentUser.email }, "-created_date");
      setMyTravels(travels);
      
      const allRequests = await RequestEntity.filter({ status: "거래전" }, "-created_date"); // Usage updated to RequestEntity
      setAvailableRequests(allRequests);

      const myTravelIds = travels.map(t => t.id);
      const allTravelerRequests = await TravelerRequest.list();
      const myReceivedRequests = allTravelerRequests.filter(tr => myTravelIds.includes(tr.traveler_id));
      setReceivedRequests(myReceivedRequests);

    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const handleTravelAdded = () => {
    setShowForm(false);
    setEditingTravel(null);
    loadData();
  };

  const handleEditTravel = (travel) => {
    setEditingTravel(travel);
    setShowForm(true);
  };

  const handleDeleteTravel = async (travelId) => {
    if (window.confirm("정말로 이 여행 일정을 삭제하시겠습니까?")) {
      try {
        await Traveler.delete(travelId);
        setMyTravels(prev => prev.filter(t => t.id !== travelId));
        alert("여행 일정이 삭제되었습니다.");
      } catch (error) {
        console.error("여행 일정 삭제 실패:", error);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("MyProfile"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">여행자 대시보드</h1>
              <p className="text-sm md:text-base text-gray-600">여행 일정을 등록하고 구매 요청을 확인해보세요</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg ml-auto text-sm md:text-base"
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">새 여행 등록</span>
            <span className="sm:hidden">등록</span>
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">등록한 여행</p>
                  <p className="text-2xl font-bold text-slate-800">{myTravels.length}개</p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><Plane className="w-6 h-6 text-slate-800" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">받은 요청</p>
                  <p className="text-2xl font-bold text-red-600">{receivedRequests.filter(r => r.status === '대기중').length}개</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"><Inbox className="w-6 h-6 text-red-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">매칭 가능한 요청</p>
                  <p className="text-2xl font-bold text-teal-600">{availableRequests.length}개</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center"><Package className="w-6 h-6 text-teal-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 평점</p>
                  <p className="text-2xl font-bold text-orange-600">4.8/5</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center"><Star className="w-6 h-6 text-orange-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 내 여행 일정 (수정/삭제 가능) */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">내 여행 일정</h3>
            <div className="space-y-4">
              {myTravels.map((travel) => (
                <div key={travel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{travel.country}</h4>
                    <p className="text-sm text-gray-600">{travel.departure_date} ~ {travel.return_date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTravel(travel)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTravel(travel.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
              {myTravels.length === 0 && (
                <p className="text-center text-gray-500 py-8">등록된 여행 일정이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="received-requests" className="space-y-6">
          <TabsList className="bg-white shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger value="received-requests" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 rounded-lg">
              받은 구매 요청
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-lg">
              매칭 가능한 요청
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received-requests">
            <ReceivedRequests 
              requests={receivedRequests} 
              onRefresh={loadData}
            />
          </TabsContent>
          <TabsContent value="requests">
            <AvailableRequests 
              requests={availableRequests}
              userTravels={myTravels}
              onRefresh={loadData}
            />
          </TabsContent>
        </Tabs>

        {showForm && (
          <TravelerForm 
            travel={editingTravel}
            onClose={() => {
              setShowForm(false);
              setEditingTravel(null);
            }}
            onSuccess={handleTravelAdded}
          />
        )}
      </div>
    </div>
  );
}
