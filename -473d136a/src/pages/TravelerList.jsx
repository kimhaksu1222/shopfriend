
import React, { useState, useEffect } from "react";
import { Traveler } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Plane, ShoppingBag, Flag } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TravelerListPage() {
  const [travelers, setTravelers] = useState([]);
  const [filteredTravelers, setFilteredTravelers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadTravelers();
  }, []);

  useEffect(() => {
    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const activeTravelers = travelers.filter(t => new Date(t.return_date) >= new Date());

    if (searchTerm) {
      const filtered = activeTravelers.filter(t =>
        (t.country?.toLowerCase() || '').includes(searchTerm) ||
        (t.city?.toLowerCase() || '').includes(searchTerm) ||
        (t.created_by?.toLowerCase() || '').includes(searchTerm)
      );
      setFilteredTravelers(filtered);
    } else {
      setFilteredTravelers(activeTravelers);
    }
  }, [searchParams, travelers]);

  const loadTravelers = async () => {
    setIsLoading(true);
    try {
      const allTravelers = await Traveler.list("-created_date");
      setTravelers(allTravelers);
    } catch (error) {
      console.error("여행자 목록 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const getTravelStatus = (travel) => {
    const now = new Date();
    const departureDate = new Date(travel.departure_date);
    if (now < departureDate) return { text: "여행 예정", color: "bg-blue-100 text-blue-800" };
    return { text: "여행 중", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">여행자 둘러보기</h1>
            <p className="text-gray-600">나와 맞는 여행자를 찾아 구매를 요청해보세요!</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-4 h-48"></div>
            ))}
          </div>
        ) : filteredTravelers.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">검색된 여행자가 없어요</h3>
            <p className="text-gray-500 mt-2">다른 검색어로 찾아보거나 전체 목록을 확인해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTravelers.map((travel) => {
              const status = getTravelStatus(travel);
              return (
                <Card key={travel.id} className="bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">{travel.country}</CardTitle>
                      <Badge className={status.color}>{status.text}</Badge>
                    </div>
                    {travel.city && <p className="text-sm text-gray-500">{travel.city}</p>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(travel.departure_date), "MM/dd", { locale: ko })} ~ {format(new Date(travel.return_date), "MM/dd", { locale: ko })}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Flag className="w-4 h-4" />
                      <span>{travel.nationality} 국적</span>
                    </div>
                    <Button
                      className="w-full"
                      style={{backgroundColor: 'var(--carrot-orange)'}}
                      onClick={() => navigate(createPageUrl(`RequestToTraveler?travelerId=${travel.id}`))}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      이 여행자에게 요청하기
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
