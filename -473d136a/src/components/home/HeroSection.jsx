import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingBag,
  Plane,
  Heart,
  Globe,
  Sparkles,
  ArrowRight,
  Users,
  Star,
  MessageSquare
} from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-orange-50/50 via-white to-emerald-50/50 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-orange-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-emerald-300/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-br from-sky-200/30 to-sky-300/30 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          {/* 로고 섹션 */}
          <div className="flex justify-center mb-12">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 to-emerald-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-emerald-100/50 group-hover:scale-105 transition-all duration-500">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4149b6327_.png"
                  alt="숍프렌드 로고"
                  className="w-24 h-24"
                />
              </div>
              <div className="absolute -top-2 -right-2 animate-bounce delay-500">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-bounce delay-1000">
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-emerald-600 via-orange-500 to-sky-600 bg-clip-text text-transparent">
              숍프렌드
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-700">
              함께하는 해외쇼핑
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            🦊 🐰 친구들과 함께하는 따뜻한 해외 쇼핑 플랫폼
            <br />
            <span className="text-lg text-gray-500">
              원하는 제품을 요청하고, 여행자 친구들이 직접 가져다드려요
            </span>
          </p>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link to={createPageUrl("CreateRequest")}>
              <Button
                size="lg"
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl px-10 py-6 text-lg font-semibold rounded-3xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 border-0"
              >
                <ShoppingBag className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                구매 요청하기
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>

            <Link to={createPageUrl("TravelerList")}>
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-10 py-6 text-lg font-semibold rounded-3xl transition-all duration-500 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              >
                <Plane className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                여행자 등록하기
              </Button>
            </Link>

            {/* 내 채팅 버튼 수정 */}
            <Link to={createPageUrl("ChatList")}>
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-sky-300 text-sky-700 hover:bg-sky-50 px-10 py-6 text-lg font-semibold rounded-3xl transition-all duration-500 hover:border-sky-400 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              >
                <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                내 채팅
              </Button>
            </Link>
          </div>

          {/* 특징 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100/50 group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">간편한 요청</h3>
                <p className="text-gray-600 text-sm leading-relaxed">원하는 제품을 쉽고 빠르게 요청하세요</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100/50 group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">친구들과 함께</h3>
                <p className="text-gray-600 text-sm leading-relaxed">전 세계 친구들과 연결되어요</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-400/20 to-sky-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100/50 group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">신뢰할 수 있는</h3>
                <p className="text-gray-600 text-sm leading-relaxed">검증된 친구들의 안전한 서비스</p>
              </div>
            </div>
          </div>

          {/* 통계 섹션 */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: "1,000+", label: "행복한 고객" },
              { number: "50+", label: "국가 연결" },
              { number: "5,000+", label: "성공 거래" },
              { number: "4.9★", label: "만족도" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-emerald-100/30">
                <div className="text-2xl font-bold text-emerald-700">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}