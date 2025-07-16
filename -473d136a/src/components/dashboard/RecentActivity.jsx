
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  DollarSign,
  Package,
  User,
  ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const statusColors = {
  "대기중": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "매칭완료": "bg-blue-100 text-blue-800 border-blue-200",
  "배송중": "bg-purple-100 text-purple-800 border-purple-200",
  "완료": "bg-green-100 text-green-800 border-green-200",
  "취소": "bg-red-100 text-red-800 border-red-200"
};

const countryColors = {
  "미국": "bg-blue-100 text-blue-800 border-blue-200",
  "일본": "bg-red-100 text-red-800 border-red-200",
  "유럽": "bg-purple-100 text-purple-800 border-purple-200",
  "중국": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "동남아": "bg-green-100 text-green-800 border-green-200",
  "기타": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function RecentActivity({ requests }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          최근 활동
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {request.product_name}
                  </h4>
                  <Badge className={`${statusColors[request.status]} border text-xs`}>
                    {request.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <Badge className={`${countryColors[request.country]} border text-xs`}>
                      {request.country}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{request.target_price?.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>{request.quantity}개</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {format(new Date(request.created_date), "MM/dd HH:mm", { locale: ko })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
