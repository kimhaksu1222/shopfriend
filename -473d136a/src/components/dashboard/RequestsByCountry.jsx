import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin } from "lucide-react";

const COLORS = {
  "미국": "#3b82f6",
  "일본": "#ef4444", 
  "유럽": "#8b5cf6",
  "중국": "#eab308",
  "동남아": "#10b981",
  "기타": "#6b7280"
};

export default function RequestsByCountry({ data }) {
  const chartData = data.map(item => ({
    ...item,
    fill: COLORS[item.country] || COLORS["기타"]
  }));

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-600" />
          국가별 요청 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="count"
              label={({ country, count }) => `${country}: ${count}개`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {data.map(item => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.country] || COLORS["기타"] }}
                ></div>
                <span className="text-sm text-gray-700">{item.country}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.count}개</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}