
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Traveler } from "@/api/entities";
import { TravelBadge } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Plane, 
  Award, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Star,
  Camera,
  Flag,
  Loader2,
  Trophy,
  Gift,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TravelVerificationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myTravels, setMyTravels] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [verificationData, setVerificationData] = useState({
    proof_type: "",
    proof_image: "",
    additional_info: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const [travels, badges] = await Promise.all([
        Traveler.filter({ created_by: currentUser.email }, "-created_date"),
        TravelBadge.filter({ user_email: currentUser.email })
      ]);
      
      setMyTravels(travels);
      setMyBadges(badges);
      
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      setVerificationData(prev => ({ ...prev, proof_image: file_url }));
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  const handleVerifyTravel = async () => {
    if (!selectedTravel || !verificationData.proof_type || !verificationData.proof_image) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 기존 배지 확인
      const existingBadge = myBadges.find(b => b.country === selectedTravel.country);
      
      if (existingBadge) {
        // 기존 배지 레벨 증가
        await TravelBadge.update(existingBadge.id, { 
          level: (existingBadge.level || 1) + 1 
        });
      } else {
        // 새 배지 생성
        await TravelBadge.create({
          user_email: user.email,
          country: selectedTravel.country,
          level: 1
        });
      }

      alert(`🎉 ${selectedTravel.country} 여행 배지가 성공적으로 인증되었습니다!`);
      
      // 데이터 새로고침
      loadData();
      
      // 폼 초기화
      setSelectedTravel(null);
      setVerificationData({ proof_type: "", proof_image: "", additional_info: "" });
      
    } catch (error) {
      console.error("여행 인증 실패:", error);
      alert("여행 인증에 실패했습니다. 다시 시도해주세요.");
    }
    setIsSubmitting(false);
  };

  const handleAutoVerifyFromTravels = async () => {
    if (!user) return;
    
    try {
      // 완료된 여행 중에서 아직 배지가 없는 국가들 찾기
      const completedTravels = getCompletedTravels(); // Ensure completedTravels is up-to-date
      const unverifiedTravels = completedTravels.filter(travel => 
        !myBadges.some(badge => badge.country === travel.country)
      );
      
      if (unverifiedTravels.length === 0) {
        alert("인증 가능한 새로운 여행이 없습니다.");
        return;
      }

      let newBadgesCount = 0;
      
      for (const travel of unverifiedTravels) {
        try {
          await TravelBadge.create({
            user_email: user.email,
            country: travel.country,
            level: 1
          });
          newBadgesCount++;
        } catch (error) {
          console.error(`${travel.country} 배지 생성 실패:`, error);
        }
      }
      
      if (newBadgesCount > 0) {
        alert(`🎉 ${newBadgesCount}개의 여행 배지가 자동으로 인증되었습니다!`);
        loadData();
      } else {
        alert("배지 인증 중 오류가 발생했습니다.");
      }
      
    } catch (error) {
      console.error("자동 인증 실패:", error);
      alert("자동 인증에 실패했습니다.");
    }
  };

  const getCompletedTravels = () => {
    return myTravels.filter(travel => {
      const returnDate = new Date(travel.return_date);
      const now = new Date();
      return returnDate < now;
    });
  };

  const getBadgeColor = (level) => {
    if (level >= 5) return "from-purple-400 to-pink-400";
    if (level >= 3) return "from-yellow-400 to-orange-400";
    if (level >= 2) return "from-gray-400 to-gray-500";
    return "from-amber-400 to-amber-500";
  };

  const getBadgeIcon = (level) => {
    if (level >= 5) return Trophy;
    if (level >= 3) return Award;
    if (level >= 2) return Star;
    return Gift;
  };

  const completedTravels = getCompletedTravels();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">여행 인증 센터</h1>
            <p className="text-gray-600">여행 경험을 인증하고 배지를 획득하세요</p>
          </div>
        </div>

        {/* 내 배지 현황 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              내 여행 배지
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {myBadges.map(badge => {
                  const BadgeIcon = getBadgeIcon(badge.level);
                  return (
                    <div 
                      key={badge.id} 
                      className={`relative p-4 rounded-2xl bg-gradient-to-br ${getBadgeColor(badge.level)} text-white shadow-lg hover:scale-105 transition-transform`}
                    >
                      <div className="text-center">
                        <BadgeIcon className="w-8 h-8 mx-auto mb-2" />
                        <h3 className="font-bold text-sm">{badge.country}</h3>
                        <p className="text-xs opacity-90">Level {badge.level}</p>
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-white text-gray-800 text-xs px-2 py-1">
                          ✨ {badge.level}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>아직 획득한 배지가 없습니다.</p>
                <p className="text-sm">여행을 인증하고 첫 배지를 모아보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 여행 인증 양식 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              여행 인증하기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {completedTravels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>인증 가능한 완료된 여행이 없습니다.</p>
                <p className="text-sm">여행을 완료한 후 인증해보세요!</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인증할 여행 선택 *
                  </label>
                  <Select 
                    value={selectedTravel?.id || ""} 
                    onValueChange={(value) => {
                      const travel = completedTravels.find(t => t.id === value);
                      setSelectedTravel(travel);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="완료된 여행을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {completedTravels.map(travel => (
                        <SelectItem key={travel.id} value={travel.id}>
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            <span>{travel.country} {travel.city && `(${travel.city})`}</span>
                            <span className="text-sm text-gray-500">
                              {travel.departure_date} ~ {travel.return_date}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTravel && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        인증 방법 *
                      </label>
                      <Select 
                        value={verificationData.proof_type} 
                        onValueChange={(value) => setVerificationData(prev => ({ ...prev, proof_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="인증 방법을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport_stamp">여권 스탬프</SelectItem>
                          <SelectItem value="boarding_pass">항공권/탑승권</SelectItem>
                          <SelectItem value="landmark_photo">현지 랜드마크 사진</SelectItem>
                          <SelectItem value="receipt">현지 결제 영수증</SelectItem>
                          <SelectItem value="accommodation">숙박 확인서</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        인증 사진 업로드 *
                      </label>
                      {verificationData.proof_image ? (
                        <div className="relative">
                          <img 
                            src={verificationData.proof_image} 
                            alt="인증 사진"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVerificationData(prev => ({ ...prev, proof_image: "" }))}
                            className="absolute top-2 right-2 bg-red-50 border-red-200 text-red-600"
                          >
                            삭제
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">여행 인증 사진을 업로드하세요</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="proof-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('proof-upload').click()}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            사진 업로드
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        추가 정보 (선택)
                      </label>
                      <Input
                        placeholder="여행 경험이나 추가 설명을 입력하세요"
                        value={verificationData.additional_info}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, additional_info: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleVerifyTravel}
                        disabled={isSubmitting || !verificationData.proof_type || !verificationData.proof_image}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            인증 중...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            여행 인증하기
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 완료된 여행 목록 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                완료된 여행 기록
              </div>
              {completedTravels.length > 0 && (
                <Button
                  onClick={handleAutoVerifyFromTravels}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm py-2 px-3 h-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  자동 배지 인증
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedTravels.length > 0 ? (
              <div className="space-y-3">
                {completedTravels.map(travel => {
                  const isVerified = myBadges.some(badge => badge.country === travel.country);
                  return (
                    <div key={travel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {travel.country} {travel.city && `(${travel.city})`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {travel.departure_date} ~ {travel.return_date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isVerified ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            인증완료
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            인증대기
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>완료된 여행 기록이 없습니다.</p>
                <p className="text-sm">여행을 등록하고 완료해보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
