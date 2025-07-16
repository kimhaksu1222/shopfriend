

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  ShoppingBag, 
  Plane, 
  BarChart3, 
  User,
  Heart,
  MessageSquare,
  Shield,
  Plus,
  Search,
  Bell, 
  Menu,
  LogOut,
  Users2,
  List,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const unreadCount = 0;

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { User } = await import("@/api/entities");
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        console.error("Failed to load initial user:", error);
      }
    };
    
    checkUser();
  }, []);

  const handleLogin = async () => {
    const { User } = await import("@/api/entities");
    try {
      await User.login();
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    const { User } = await import("@/api/entities");
    await User.logout();
    setUser(null);
    navigate(createPageUrl("Home"));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(createPageUrl(`TravelerList?search=${encodeURIComponent(searchTerm)}`));
    }
  };

  const navigationItems = [
    { title: "홈", url: createPageUrl("Home"), icon: Home },
    { title: "채팅", url: createPageUrl("ChatList"), icon: MessageSquare },
    { title: "요청보기", url: createPageUrl("AllRequests"), icon: List },
    { title: "커뮤니티", url: createPageUrl("Community"), icon: Users2 },
    { title: "마이페이지", url: createPageUrl("MyProfile"), icon: User }
  ];

  const mainMenuItems = [
    { title: "구매 요청하기", url: createPageUrl("CreateRequest"), icon: ShoppingBag, description: "원하는 제품을 요청해보세요" },
    { title: "여행자 등록", url: createPageUrl("TravelerDashboard"), icon: Plane, description: "여행 일정을 등록하고 도와주세요" },
    { title: "여행자 찾기", url: createPageUrl("TravelerList"), icon: Users2, description: "여행자를 찾아 요청하세요" },
    { title: "내 채팅", url: createPageUrl("ChatList"), icon: MessageSquare, description: "진행중인 채팅을 확인하세요" },
    { title: "여행 인증", url: createPageUrl("TravelVerification"), icon: Award, description: "여행 배지를 인증하세요" },
    { title: "커뮤니티", url: createPageUrl("Community"), icon: Users2, description: "사용자들과 소통해보세요" },
    { title: "대시보드", url: createPageUrl("Dashboard"), icon: BarChart3, description: "나의 활동을 확인해보세요" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --carrot-orange: #ff6f0f;
          --carrot-orange-light: #ff8f3f;
          --carrot-gray: #868e96;
          --carrot-light-gray: #f8f9fa;
          --carrot-dark: #212529;
        }
        
        .nav-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px;
          position: relative;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #ff6f0f 0%, #ff8f3f 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 111, 15, 0.3);
        }
        
        .nav-item:hover:not(.active) {
          background: rgba(255, 111, 15, 0.1);
          transform: translateY(-1px);
        }
        
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ff6f0f, #ff8f3f);
          transition: width 0.3s ease;
        }
        
        .nav-item.active::after {
          width: 80%;
        }
      `}</style>

      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4149b6327_.png" 
                  alt="숍프렌드 로고" 
                  className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-emerald-600 bg-clip-text text-transparent">숍프렌드</h1>
                <p className="text-xs text-gray-500 -mt-1">함께하는 해외쇼핑</p>
              </div>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="어떤 여행자를 찾고 계신가요?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </form>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-600 hover:text-orange-500 transition-colors"
                    onClick={() => alert("알림 기능은 현재 점검 중입니다.")}
                  >
                    <Bell className="w-5 h-5" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden md:flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 h-auto">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user.profile_picture_url ? (
                            <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div className="text-sm text-left">
                          <p className="font-medium text-gray-900 truncate max-w-24">
                            {user.nickname || user.full_name}
                          </p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('MyProfile'))}>
                        <User className="w-4 h-4 mr-2" />
                        내 정보
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('Community'))}>
                        <Users2 className="w-4 h-4 mr-2" />
                        커뮤니티
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('ChatList'))}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        채팅
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('AllRequests'))}>
                        <List className="w-4 h-4 mr-2" />
                        요청 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('TravelVerification'))}>
                        <Award className="w-4 h-4 mr-2" />
                        여행 인증
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.role === 'admin' && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(createPageUrl('AdminAccess'))}>
                            <Shield className="w-4 h-4 mr-2" />
                            관리자
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  로그인
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 모바일 검색바 */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="어떤 여행자를 찾고 계신가요?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </form>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {mainMenuItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-emerald-400 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              ))}
              
              {user?.role === 'admin' && (
                <Link
                  to={createPageUrl("AdminAccess")}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-400 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">관리자</p>
                    <p className="text-xs text-gray-500">관리자 전용</p>
                  </div>
                </Link>
              )}
              
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        {/* 빠른 액션 바 (홈페이지가 아닐 때만 표시) */}
        {location.pathname !== createPageUrl("Home") && (
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                <Link
                  to={createPageUrl("CreateRequest")}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:from-orange-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  구매 요청
                </Link>
                
                <Link
                  to={createPageUrl("TravelerList")}
                  className="flex items-center gap-2 bg-white border-2 border-orange-200 text-orange-600 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-orange-50 transition-all duration-300"
                >
                  <Users2 className="w-4 h-4" />
                  여행자 찾기
                </Link>
                
                <Link
                  to={createPageUrl("TravelerDashboard")}
                  className="flex items-center gap-2 bg-white border-2 border-emerald-200 text-emerald-600 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-emerald-50 transition-all duration-300"
                >
                  <Plane className="w-4 h-4" />
                  여행 일정 등록
                </Link>
                
                <Link
                  to={createPageUrl("ChatList")}
                  className="flex items-center gap-2 bg-white border-2 border-sky-200 text-sky-600 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-sky-50 transition-all duration-300 relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  채팅
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 페이지 컨텐츠 */}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* 하단 네비게이션 (모바일) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="flex items-center justify-around h-20 px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`nav-item flex flex-col items-center justify-center flex-1 h-full px-1 ${
                  isActive ? 'active' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 mb-1 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 하단 여백 (모바일 네비게이션 공간 확보) */}
      <div className="md:hidden h-20"></div>

      {/* 플로팅 액션 버튼 (데스크톱) */}
      <div className="hidden md:block fixed bottom-8 right-8">
        <Link to={createPageUrl("CreateRequest")}>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

