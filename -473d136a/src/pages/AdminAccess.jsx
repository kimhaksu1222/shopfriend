
import React, { useState } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Settings, BarChart3, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminAccessPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_PASSWORD = "0804"; // 비밀번호 변경

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        navigate(createPageUrl("Home"));
      }
    };
    checkUser();
  }, [navigate]);

  const handleAdminLogin = async () => {
    if (password === ADMIN_PASSWORD) {
      navigate(createPageUrl("Admin"));
    } else {
      alert("잘못된 관리자 비밀번호입니다.");
    }
  };

  const adminFeatures = [
    {
      title: "전체 통계 대시보드",
      description: "사용자, 요청, 거래 현황을 한눈에 확인",
      icon: BarChart3,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "사용자 관리",
      description: "사용자 계정 관리 및 권한 설정",
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    {
      title: "콘텐츠 관리",
      description: "부적절한 콘텐츠 모니터링 및 삭제",
      icon: Eye,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "신고 처리",
      description: "사용자 신고 접수 및 처리",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600"
    },
    {
      title: "시스템 설정",
      description: "앱 설정 및 구성 관리",
      icon: Settings,
      color: "from-gray-500 to-gray-600"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 접근</h1>
          <p className="text-gray-600">숍프렌드 관리자 대시보드에 접근하려면 인증이 필요합니다</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-gray-900">
              관리자 인증
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="password"
                placeholder="관리자 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="pl-12 border-red-200 focus:border-red-400 focus:ring-red-300 rounded-2xl bg-white/80 backdrop-blur-sm h-12 text-lg"
              />
            </div>
            <Button 
              onClick={handleAdminLogin}
              disabled={!password || isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl h-12 shadow-lg text-lg font-semibold"
            >
              {isLoading ? "인증 중..." : "관리자 로그인"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            관리자 권한이 필요한 기능입니다. 비밀번호를 분실하신 경우 시스템 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
