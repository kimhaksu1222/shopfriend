import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Request as RequestEntity } from "@/api/entities";
import { Traveler } from "@/api/entities";
import { Review } from "@/api/entities";
import { TravelBadge } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UploadFile, GenerateImage } from "@/api/integrations";
import { 
  User as UserIcon, 
  Star, 
  ShoppingBag, 
  Plane, 
  Trophy,
  Package,
  Crown,
  Heart,
  Award,
  Zap,
  Gift,
  HelpCircle,
  AlertCircle,
  MessageCircle as MessageIcon,
  Bell,
  ChevronRight,
  Ticket,
  Users2,
  BarChart3,
  Edit,
  Save,
  Camera,
  Loader2,
  Sparkles,
  Shuffle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CountryBadge from "../components/profile/CountryBadge";

const avatarEmojis = [
  '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸',
  '🐧', '🐥', '🦄', '🐷', '🐵', '🐲', '🦋', '🌟', '🎈', '🎨',
  '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🥳', '😊',
  '😎', '🤗', '😇', '🥰', '😋', '🤩', '🥳', '🌈', '⭐', '✨'
];

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [completedTravels, setCompletedTravels] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setNickname(currentUser.nickname || currentUser.full_name);
      
      const [requests, travels, reviews, badges] = await Promise.all([
        RequestEntity.filter({ created_by: currentUser.email }, "-created_date"),
        Traveler.filter({ created_by: currentUser.email }, "-created_date"),
        Review.filter({ reviewee_email: currentUser.email }, "-created_date"),
        TravelBadge.filter({ user_email: currentUser.email })
      ]);
      
      const completed = travels.filter(t => new Date(t.return_date) < new Date());
      setCompletedTravels(completed);
      setMyBadges(badges);
      
      const completedRequests = requests.filter(r => r.status === "거래완료").length;
      const totalInterests = requests.reduce((sum, r) => sum + (r.interest_count || 0), 0);
      const totalChats = requests.reduce((sum, r) => sum + (r.chat_count || 0), 0);
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      
      setStats({
        totalRequests: requests.length,
        completedRequests,
        totalTravels: travels.length,
        totalInterests,
        totalChats,
        avgRating: Math.round(avgRating * 10) / 10,
      });
      
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const handleSaveNickname = async () => {
    try {
      await User.updateMyUserData({ nickname });
      setUser(prev => ({...prev, nickname}));
      setIsEditing(false);
      alert("별명이 성공적으로 변경되었습니다.");
    } catch(error) {
        console.error("별명 변경 실패:", error);
        alert("별명 변경에 실패했습니다.");
    }
  }

  const handleAvatarSelect = async (url) => {
    try {
      await User.updateMyUserData({ profile_picture_url: url });
      setUser(prev => ({...prev, profile_picture_url: url}));
      setShowAvatarDialog(false);
      alert("프로필 사진이 변경되었습니다.");
    } catch (error) {
      console.error("프로필 사진 변경 실패:", error);
      alert("프로필 사진 변경에 실패했습니다.");
    }
  };

  const handleEmojiSelect = async (emoji) => {
    try {
      // 이모지를 프로필 사진으로 설정하기 위해 특별한 형식으로 저장
      const emojiUrl = `emoji:${emoji}`;
      await User.updateMyUserData({ profile_picture_url: emojiUrl });
      setUser(prev => ({...prev, profile_picture_url: emojiUrl}));
      setShowAvatarDialog(false);
      alert("프로필 이모지가 변경되었습니다!");
    } catch (error) {
      console.error("프로필 이모지 변경 실패:", error);
      alert("프로필 이모지 변경에 실패했습니다.");
    }
  };

  const handleGenerateAIAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const randomStyles = [
        "cute cartoon character, kawaii style, pastel colors",
        "friendly animal character, cartoon style, bright colors",
        "adorable mascot character, chibi style, colorful",
        "cute pixel art character, 8-bit style, vibrant colors",
        "friendly robot character, modern flat design, cheerful colors"
      ];
      
      const randomStyle = randomStyles[Math.floor(Math.random() * randomStyles.length)];
      
      const result = await GenerateImage({
        prompt: `A ${randomStyle}, round profile picture, white background, simple design, friendly expression, no text, centered composition, high quality digital art`
      });
      
      if (result && result.url) {
        await handleAvatarSelect(result.url);
        alert("🎨 AI가 귀여운 프로필 이미지를 생성했습니다!");
      } else {
        throw new Error("AI 이미지 생성 실패");
      }
    } catch (error) {
      console.error("AI 아바타 생성 실패:", error);
      alert("AI 아바타 생성에 실패했습니다. 다시 시도해주세요.");
    }
    setIsGeneratingAvatar(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await handleAvatarSelect(file_url);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    }
    setIsUploading(false);
  };

  const getUserMileage = () => {
    const mileage = (stats.completedRequests * 50) + (stats.totalInterests * 5) + (stats.totalChats * 2) + (stats.avgRating * 10);
    
    if (mileage >= 600) return { 
      level: "퍼스트클래스", 
      color: "from-purple-500 via-pink-500 to-red-500", 
      icon: Crown, 
      mileage,
      range: "600M~1000M",
      emoji: "👑",
      bgPattern: "bg-gradient-to-r"
    };
    if (mileage >= 250) return { 
      level: "비즈니스", 
      color: "from-blue-500 via-indigo-500 to-purple-500", 
      icon: Trophy, 
      mileage,
      range: "250M~600M",
      emoji: "💼",
      bgPattern: "bg-gradient-to-r"
    };
    if (mileage >= 100) return { 
      level: "프리미엄 이코노미", 
      color: "from-yellow-400 via-orange-400 to-red-400", 
      icon: Star, 
      mileage,
      range: "100M~250M",
      emoji: "⭐",
      bgPattern: "bg-gradient-to-r"
    };
    if (mileage >= 1) return { 
      level: "이코노미", 
      color: "from-green-400 via-emerald-400 to-teal-400", 
      icon: Zap, 
      mileage,
      range: "1M~100M",
      emoji: "✈️",
      bgPattern: "bg-gradient-to-r"
    };
    return { 
      level: "새싹", 
      color: "from-gray-400 via-slate-400 to-gray-500", 
      icon: Heart, 
      mileage: 0,
      range: "0M",
      emoji: "🌱",
      bgPattern: "bg-gradient-to-r"
    };
  };

  const renderProfilePicture = () => {
    if (user?.profile_picture_url) {
      if (user.profile_picture_url.startsWith('emoji:')) {
        const emoji = user.profile_picture_url.replace('emoji:', '');
        return (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-6xl shadow-2xl">
            {emoji}
          </div>
        );
      } else {
        return (
          <div 
            className="w-32 h-32 rounded-full shadow-2xl bg-cover bg-center"
            style={{backgroundImage: `url(${user.profile_picture_url})`}}
          />
        );
      }
    } else {
      return (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-2xl">
          <UserIcon className="w-16 h-16 text-gray-500" />
        </div>
      );
    }
  };

  const userLevel = getUserMileage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      category: "내 거래",
      items: [
        { title: "판매내역", icon: ShoppingBag, description: "내가 도와준 거래들", count: stats.completedRequests, url: "MyTransactions" },
        { title: "구매내역", icon: Package, description: "내가 요청한 거래들", count: stats.totalRequests, url: "MyTransactions" },
        { title: "찜한 상품", icon: Heart, description: "관심있는 상품들", url: "Wishlist" },
        { title: "쿠폰함", icon: Ticket, description: "준비 중입니다", count: "준비중" },
        { title: "이벤트", icon: Gift, description: "진행중인 이벤트", count: 2, url: "Events" }
      ]
    },
    {
      category: "여행자 메뉴",
      items: [
        { title: "여행자 대시보드", icon: Plane, description: "여행 일정 관리", url: "TravelerDashboard" },
        { title: "여행 인증", icon: Award, description: "여행 배지 인증하기", url: "TravelVerification" }
      ]
    },
    {
      category: "내 계정",
      items: [
        { title: "커뮤니티", icon: Users2, description: "사용자들과 소통해보세요", url: "Community" }
      ]
    },
    {
      category: "고객센터",
      items: [
        { title: "자주 묻는 질문", icon: HelpCircle, description: "궁금한 점을 해결하세요", url: "CustomerService" },
        { title: "신고하기", icon: AlertCircle, description: "문제 상황을 신고하세요", url: "CustomerService" },
        { title: "문의하기", icon: MessageIcon, description: "1:1 문의를 남겨주세요", url: "CustomerService" },
        { title: "공지사항", icon: Bell, description: "새로운 소식을 확인하세요", url: "CustomerService" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
            <p className="text-gray-600">나의 활동과 마일리지를 확인해보세요</p>
          </div>
        </div>

        {/* 프로필 카드 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 mb-8 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400"></div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <button onClick={() => setShowAvatarDialog(true)} className="group">
                  {renderProfilePicture()}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all">
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className={`bg-gradient-to-r ${userLevel.color} text-white border-0 px-4 py-1 shadow-lg`}>
                    {userLevel.level}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-4 justify-center md:justify-start mb-2">
                  {isEditing ? (
                    <Input 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="text-2xl font-bold text-gray-900"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{nickname}</h2>
                  )}
                  {isEditing ? (
                    <Button size="icon" onClick={handleSaveNickname}>
                      <Save className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                      <Edit className="w-5 h-5 text-gray-500" />
                    </Button>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{user?.email}</p>
                
                {/* 마일리지 시스템 */}
                <div className={`${userLevel.bgPattern} ${userLevel.color} rounded-2xl p-6 mb-4 text-white shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{userLevel.emoji}</span>
                      <span className="font-semibold">숍프렌드 마일리지</span>
                    </div>
                    <span className="text-2xl font-bold">{Math.round(userLevel.mileage)}M</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-3 mb-2">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((userLevel.mileage / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm opacity-90">
                    <span>{userLevel.level} ({userLevel.range})</span>
                    <span>다음 등급까지 {Math.max(0, getNextLevelTarget(userLevel.mileage) - userLevel.mileage)}M</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalRequests}</div>
                    <div className="text-sm text-gray-600">총 요청</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{stats.completedRequests}</div>
                    <div className="text-sm text-gray-600">완료</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalTravels}</div>
                    <div className="text-sm text-gray-600">여행 등록</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-orange-500 fill-current" />
                      <div className="text-2xl font-bold text-orange-600">{stats.avgRating}</div>
                    </div>
                    <div className="text-sm text-gray-600">평균 평점</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 여행 배지 섹션 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-8">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Award className="text-yellow-500" />
                    나의 여행 배지
                </CardTitle>
            </CardHeader>
            <CardContent>
                {myBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {myBadges.map(badge => (
                            <CountryBadge key={badge.id} country={badge.country} level={badge.level} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">아직 획득한 배지가 없습니다. 여행을 인증하고 첫 배지를 모아보세요!</p>
                )}
            </CardContent>
        </Card>

        {/* 메뉴 섹션 */}
        <div className="space-y-8">
          {menuItems.map((section) => (
            <Card key={section.category} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <div 
                      key={item.title} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => item.url && navigate(createPageUrl(item.url))}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.count && (
                          <Badge className="bg-purple-100 text-purple-700">{item.count}</Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>프로필 사진 변경</DialogTitle>
              <DialogDescription>
                원하는 방식으로 프로필을 설정해보세요.
              </DialogDescription>
            </DialogHeader>
            
            {/* AI 아바타 생성 */}
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={handleGenerateAIAvatar}
                  disabled={isGeneratingAvatar}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isGeneratingAvatar ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      AI 아바타 생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" />
                      AI 아바타 랜덤 생성
                    </>
                  )}
                </Button>
              </div>

              {/* 이모지 선택 */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shuffle className="w-4 h-4" />
                  귀여운 이모지 선택
                </h4>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                  {avatarEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 직접 업로드 */}
              <div>
                <input 
                  type="file" 
                  id="avatar-upload"
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="avatar-upload">
                    {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Camera className="mr-2" />}
                    {isUploading ? "업로드 중..." : "직접 업로드"}
                  </label>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function getNextLevelTarget(currentMileage) {
  if (currentMileage < 100) return 100;
  if (currentMileage < 250) return 250;
  if (currentMileage < 600) return 600;
  return 1000;
}