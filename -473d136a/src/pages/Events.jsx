import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Traveler } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, 
  Star, 
  Calendar, 
  Trophy,
  Heart,
  CheckCircle,
  Sparkles,
  Target,
  Award,
  Users2,
  Megaphone,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const [requests, travels] = await Promise.all([
        RequestEntity.filter({ created_by: currentUser.email }),
        Traveler.filter({ created_by: currentUser.email })
      ]);
      
      const completedRequests = requests.filter(r => r.status === "거래완료").length;
      const completedTravels = travels.filter(t => new Date(t.return_date) < new Date()).length;
      
      setUserStats({
        completedRequests,
        completedTravels,
        totalRequests: requests.length,
        totalTravels: travels.length
      });
      
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const events = [
    {
      id: 1,
      title: "🎉 첫 거래 인증 이벤트",
      description: "첫 거래를 완료하고 스타벅스 쿠폰을 받아가세요!",
      type: "mission",
      status: userStats.completedRequests > 0 ? "completed" : "active",
      reward: "스타벅스 아메리카노 쿠폰",
      condition: "첫 거래 완료",
      endDate: "2025.12.31",
      color: "from-green-400 to-emerald-500",
      icon: CheckCircle,
      progress: userStats.completedRequests > 0 ? 100 : 0,
      maxProgress: 1
    },
    {
      id: 2,
      title: "✈️ 여행자 첫 등록 이벤트",
      description: "여행 일정을 처음 등록하면 마일리지 보너스!",
      type: "mission",
      status: userStats.totalTravels > 0 ? "completed" : "active",
      reward: "300 마일리지 포인트",
      condition: "첫 여행 일정 등록",
      endDate: "2025.12.31",
      color: "from-blue-400 to-sky-500",
      icon: Trophy,
      progress: userStats.totalTravels > 0 ? 100 : 0,
      maxProgress: 1
    },
    {
      id: 3,
      title: "🌟 파워 유저 도전",
      description: "5회 이상 거래 완료시 특별 혜택을 드려요!",
      type: "challenge",
      status: userStats.completedRequests >= 5 ? "completed" : "active",
      reward: "VIP 등급 + 특별 쿠폰",
      condition: "거래 5회 완료",
      endDate: "상시 진행",
      color: "from-purple-400 to-pink-500",
      icon: Star,
      progress: Math.min(userStats.completedRequests, 5),
      maxProgress: 5
    },
    {
      id: 4,
      title: "🎯 신규 가입 환영 이벤트",
      description: "숍프렌드에 오신 것을 환영합니다!",
      type: "welcome",
      status: "completed",
      reward: "웰컴 마일리지 500점",
      condition: "회원가입 완료",
      endDate: "가입 즉시",
      color: "from-orange-400 to-red-500",
      icon: Heart,
      progress: 100,
      maxProgress: 100
    }
  ];

  // 관리자 전용 공지사항
  const adminAnnouncements = [
    {
      id: 1,
      title: "🎉 숍프렌드 MVP 오픈!",
      content: "새로운 해외쇼핑 플랫폼이 오픈했습니다. 많은 관심과 참여 부탁드립니다!",
      date: "2025.01.20",
      author: "숍프렌드 팀",
      isImportant: true
    },
    {
      id: 2,
      title: "✈️ 첫 거래 이벤트 진행중",
      content: "첫 거래를 완료하시면 스타벅스 쿠폰을 드립니다! 지금 바로 참여해보세요.",
      date: "2025.01.15",
      author: "이벤트팀",
      isImportant: false
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">이벤트 & 공지</h1>
            <p className="text-gray-600">다양한 이벤트에 참여하고 최신 소식을 확인해보세요</p>
          </div>
        </div>

        <Tabs defaultValue="events" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg">
              이벤트 & 혜택
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg">
              공지사항
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-8">
            {/* 내 진행 상황 */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  내 활동 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{userStats.completedRequests}</div>
                    <div className="text-sm text-gray-600">완료된 거래</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalTravels}</div>
                    <div className="text-sm text-gray-600">등록한 여행</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{userStats.totalRequests}</div>
                    <div className="text-sm text-gray-600">총 요청</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">{events.filter(e => e.status === "completed").length}</div>
                    <div className="text-sm text-gray-600">완료한 이벤트</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 이벤트 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const IconComponent = event.icon;
                return (
                  <Card key={event.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${event.color}`}></div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${event.color} rounded-xl flex items-center justify-center`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">
                              {event.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            event.status === "completed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {event.status === "completed" ? "완료" : "진행중"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">조건:</span>
                          <span className="font-medium">{event.condition}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">보상:</span>
                          <span className="font-medium text-purple-600">{event.reward}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">기간:</span>
                          <span className="font-medium">{event.endDate}</span>
                        </div>
                        
                        {/* 진행률 */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">진행률</span>
                            <span className="font-medium">{event.progress}/{event.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${event.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${(event.progress / event.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {event.status === "completed" ? (
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                            disabled
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            완료됨
                          </Button>
                        ) : (
                          <Button 
                            className={`w-full bg-gradient-to-r ${event.color} text-white hover:shadow-lg transition-all duration-300`}
                            onClick={() => {
                              if (event.type === "mission" && event.id === 1) {
                                navigate(createPageUrl("CreateRequest"));
                              } else if (event.type === "mission" && event.id === 2) {
                                navigate(createPageUrl("TravelerDashboard"));
                              } else {
                                alert("이벤트 참여를 위해 더 많은 활동을 해보세요!");
                              }
                            }}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            참여하기
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            {/* 관리자 전용 글쓰기 버튼 */}
            {user?.role === 'admin' && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Megaphone className="w-6 h-6 text-orange-500" />
                      <div>
                        <h3 className="font-bold text-gray-900">관리자 전용</h3>
                        <p className="text-sm text-gray-600">공지사항을 작성하고 관리할 수 있습니다</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => alert("공지사항 작성 기능은 준비 중입니다.")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      공지 작성
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 공지사항 목록 */}
            <div className="space-y-4">
              {adminAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  {announcement.isImportant && (
                    <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {announcement.isImportant && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <Megaphone className="w-3 h-3 mr-1" />
                            중요
                          </Badge>
                        )}
                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                      </div>
                      <span className="text-sm text-gray-500">{announcement.date}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{announcement.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">작성자: {announcement.author}</span>
                      <Button variant="outline" size="sm">
                        자세히 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {adminAnnouncements.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">공지사항이 없습니다</h3>
                  <p className="text-gray-500">새로운 공지사항을 기다려주세요!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 추가 안내 */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">더 많은 이벤트가 준비되고 있어요!</h3>
                <p className="text-gray-600">숍프렌드 커뮤니티에서 새로운 이벤트 소식을 확인해보세요.</p>
              </div>
              <Button 
                onClick={() => navigate(createPageUrl("Community"))}
                className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                커뮤니티 가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}