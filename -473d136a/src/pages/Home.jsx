
import React, { useState, useEffect } from "react";
import { Request as RequestEntity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Package,
  Heart,
  Sparkles,
  Users2,
  MessageSquare,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Globe,
  ShoppingBag,
  Zap,
  Plane
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import RequestCard from "../components/home/RequestCard";
import BannerSlider from "../components/home/BannerSlider";

export default function HomePage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    loadRequests();

    // URL에서 검색어 파라미터 확인 및 적용
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, selectedCountry, sortBy]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await RequestEntity.filter({ status: "거래전" }, "-created_date");
      setRequests(data || []); // 빈 배열로 기본값 설정
    } catch (error) {
      console.error("요청 목록 로드 실패:", error);
      setRequests([]); // 오류 시 빈 배열로 설정
    }
    setIsLoading(false);
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry !== "all") {
      filtered = filtered.filter(request => request.country === selectedCountry);
    }

    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "deadline":
        filtered = filtered.filter(request => request.deadline); // 마감일이 있는 것만 필터링
        filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case "price_low":
        filtered.sort((a, b) => (a.target_price + (a.service_fee || 0)) - (b.target_price + (b.service_fee || 0)));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.target_price + (b.service_fee || 0)) - (a.target_price + (a.service_fee || 0)));
        break;
      case "popular":
        filtered.sort((a, b) => {
          const scoreA = (a.view_count || 0) + (a.interest_count || 0) * 2 + (a.chat_count || 0) * 3;
          const scoreB = (b.view_count || 0) + (b.interest_count || 0) * 2 + (b.chat_count || 0) * 3;
          return scoreB - scoreA;
        });
        break;
    }

    setFilteredRequests(filtered);
  };

  // Define HeroSection component locally within HomePage
  const HeroSection = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-emerald-500/5 to-sky-500/10">
      {/* 배경 장식 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-orange-300/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-emerald-300/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-gradient-to-br from-sky-300/20 to-sky-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          {/* 로고 및 타이틀 */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-orange-400/30 to-emerald-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
              <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-full shadow-2xl border border-orange-100/50 group-hover:scale-110 transition-all duration-500">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4149b6327_.png"
                  alt="숍프렌드 로고"
                  className="w-20 h-20"
                />
              </div>
              <div className="absolute -top-2 -right-2 animate-bounce delay-500">
                <Sparkles className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 via-emerald-600 to-sky-600 bg-clip-text text-transparent">
              숍프렌드
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-4 font-medium">
            🌍 전 세계 친구들과 함께하는 스마트한 해외쇼핑
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            원하는 제품을 요청하고, 여행자 친구들이 직접 가져다드려요
          </p>

          {/* 메인 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link to={createPageUrl("CreateRequest")}>
              <Button
                size="lg"
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl px-8 py-6 text-lg font-bold rounded-full transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 border-0"
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                구매 요청하기
              </Button>
            </Link>

            <Link to={createPageUrl("TravelerDashboard")}>
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg font-bold rounded-full transition-all duration-500 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-2 bg-white/90 backdrop-blur-sm"
              >
                <Plane className="w-6 h-6 mr-3" />
                내 여행 등록하기
              </Button>
            </Link>

            <Link to={createPageUrl("TravelerList")}>
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-sky-400 text-sky-700 hover:bg-sky-50 px-8 py-6 text-lg font-bold rounded-full transition-all duration-500 hover:border-sky-500 hover:shadow-xl hover:-translate-y-2 bg-white/90 backdrop-blur-sm"
              >
                <Users2 className="w-6 h-6 mr-3" />
                여행자 찾기
              </Button>
            </Link>
          </div>
          {/* BannerSlider was here previously, but is now rendered separately after HeroSection */}
        </div>
      </div>
    </div>
  );

  // Define FilterBar component locally within HomePage
  const FilterBar = ({ searchTerm, setSearchTerm, selectedCountry, setSelectedCountry, sortBy, setSortBy, requests }) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/30 to-emerald-400/30 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-orange-100/50">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">원하는 상품을 찾아보세요!</h2>
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                placeholder="제품명 또는 키워드로 검색해보세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-700 placeholder:text-gray-500 h-14 text-lg"
              />
            </div>

            <div className="md:col-span-3">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="border-emerald-200/50 rounded-2xl bg-white/80 backdrop-blur-sm h-14 focus:border-emerald-400 focus:ring-emerald-300 text-lg">
                  <SelectValue placeholder="국가 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-emerald-100 rounded-2xl">
                  <SelectItem value="all" className="rounded-xl text-lg">🌍 모든 국가</SelectItem>
                  <SelectItem value="미국" className="rounded-xl text-lg">🇺🇸 미국</SelectItem>
                  <SelectItem value="일본" className="rounded-xl text-lg">🇯🇵 일본</SelectItem>
                  <SelectItem value="유럽" className="rounded-xl text-lg">🇪🇺 유럽</SelectItem>
                  <SelectItem value="중국" className="rounded-xl text-lg">🇨🇳 중국</SelectItem>
                  <SelectItem value="동남아" className="rounded-xl text-lg">🌏 동남아</SelectItem>
                  <SelectItem value="기타" className="rounded-xl text-lg">🌐 기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-emerald-200/50 rounded-2xl bg-white/80 backdrop-blur-sm h-14 focus:border-emerald-400 focus:ring-emerald-300 text-lg">
                  <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-emerald-100 rounded-2xl">
                  <SelectItem value="latest" className="rounded-xl text-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      최신순
                    </div>
                  </SelectItem>
                  <SelectItem value="popular" className="rounded-xl text-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      인기순
                    </div>
                  </SelectItem>
                  <SelectItem value="deadline" className="rounded-xl text-lg">마감일순</SelectItem>
                  <SelectItem value="price_low" className="rounded-xl text-lg">낮은 가격순</SelectItem>
                  <SelectItem value="price_high" className="rounded-xl text-lg">높은 가격순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 퀵 링크 */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-orange-500" />
          인기 카테고리
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { country: "미국", emoji: "🇺🇸", color: "from-red-400 to-blue-500" },
            { country: "일본", emoji: "🇯🇵", color: "from-red-500 to-pink-500" },
            { country: "유럽", emoji: "🇪🇺", color: "from-purple-500 to-indigo-500" },
            { country: "중국", emoji: "🇨🇳", color: "from-yellow-400 to-red-500" },
            { country: "동남아", emoji: "🌏", color: "from-green-400 to-teal-500" },
            { country: "기타", emoji: "🌍", color: "from-gray-400 to-gray-600" }
          ].map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCountry(category.country)}
              className={`group p-6 bg-gradient-to-br ${category.color} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white`}
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {category.emoji}
              </div>
              <div className="font-bold text-lg">{category.country}</div>
              <div className="text-sm opacity-90">
                {requests.filter(r => r.country === category.country).length}개 요청
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-emerald-50/30">
      <HeroSection />
      
      {/* 배너 슬라이더 추가 (새로운 위치) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <BannerSlider />
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        sortBy={sortBy}
        setSortBy={setSortBy}
        requests={requests} // Pass requests to FilterBar for category counts
      />

      {/* 요청 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-orange-500" />
              최신 구매 요청
              <span className="text-lg font-normal text-gray-600">({filteredRequests.length}개)</span>
            </h2>
            <Link to={createPageUrl("AllRequests")}>
              <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 rounded-2xl px-6 py-3">
                전체 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* 상품 카드 그리드 */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {isLoading ? (
              Array(16).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-3 space-y-3 shadow-sm">
                    <div className="aspect-square bg-gray-200 rounded-xl"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredRequests.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="relative inline-block mb-6">
                  <Package className="w-32 h-32 text-gray-300 mx-auto" />
                  <Heart className="absolute -top-4 -right-4 w-12 h-12 text-orange-400 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? "검색 결과가 없어요 😅" : "아직 요청이 없어요 🌟"}
                </h3>
                <p className="text-gray-500 mb-8 text-lg">
                  {searchTerm ? "다른 검색어로 시도해보세요" : "첫 번째 요청을 등록해보세요"}
                </p>
                <Link to={createPageUrl("CreateRequest")}>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    첫 요청 등록하기 🚀
                  </Button>
                </Link>
              </div>
            ) : (
              filteredRequests.slice(0, 24).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>

          {/* 더 보기 버튼 */}
          {filteredRequests.length > 24 && (
            <div className="text-center mt-12">
              <Link to={createPageUrl("AllRequests")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 px-12 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  더 많은 요청 보기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
