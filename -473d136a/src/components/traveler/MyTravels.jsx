
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Package,
  MessageCircle,
  Plane,
  Clock,
  ShoppingBag // Added ShoppingBag icon
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import { createPageUrl } from '@/utils'; // Assuming createPageUrl is in a utility file

export default function MyTravels({ travels, onRefresh }) {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleContact = (contact_info) => {
    if (contact_info.startsWith('http')) {
      window.open(contact_info, '_blank');
    } else {
      window.location.href = `tel:${contact_info}`;
    }
  };

  const handleRequestToTraveler = (travelId) => {
    navigate(createPageUrl(`RequestToTraveler?travelerId=${travelId}`));
  };

  const getTravelStatus = (travel) => {
    if (!travel.departure_date || !travel.return_date) {
      return { status: "날짜오류", color: "bg-red-100 text-red-800 border-red-200" };
    }
    const now = new Date();
    const departureDate = new Date(travel.departure_date);
    const returnDate = new Date(travel.return_date);

    if (now < departureDate) {
      return { status: "예정", color: "bg-blue-100 text-blue-800 border-blue-200" };
    } else if (now >= departureDate && now <= returnDate) {
      return { status: "여행중", color: "bg-green-100 text-green-800 border-green-200" };
    } else {
      return { status: "완료", color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  if (travels.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 여행이 없습니다</h3>
          <p className="text-gray-500">첫 여행 일정을 등록해보세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {travels.map((travel) => {
        const { status, color } = getTravelStatus(travel);

        return (
          <Card key={travel.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-800" />
                  <h3 className="font-bold text-lg text-gray-900">
                    {travel.country}
                  </h3>
                </div>
                <Badge className={`${color} border text-xs`}>
                  {status}
                </Badge>
              </div>
              {travel.city && (
                <p className="text-gray-600 text-sm">{travel.city}</p>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {travel.departure_date && travel.return_date ? `${format(new Date(travel.departure_date), "MM/dd", { locale: ko })} - ${format(new Date(travel.return_date), "MM/dd", { locale: ko })}` : '날짜 미정'}
                  </span>
                </div>

                {travel.max_weight && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">최대 {travel.max_weight}kg</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {travel.created_date ? format(new Date(travel.created_date), "MM/dd 등록", { locale: ko }) : '-'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                <Button
                  size="sm"
                  onClick={() => handleContact(travel.contact_info)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  연락처 확인
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestToTraveler(travel.id)}
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  이 여행자에게 요청하기
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
