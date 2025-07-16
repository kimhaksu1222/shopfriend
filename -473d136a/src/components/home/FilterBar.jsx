import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Sparkles, TrendingUp } from "lucide-react";

export default function FilterBar({ 
  searchTerm, 
  setSearchTerm, 
  selectedCountry, 
  setSelectedCountry, 
  sortBy, 
  setSortBy 
}) {
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-emerald-400/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-emerald-100/50">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span className="font-medium text-gray-700">원하는 상품을 찾아보세요!</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
            <Input
              placeholder="제품명 또는 키워드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-700 placeholder:text-gray-500 h-12"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-40 border-emerald-200/50 rounded-2xl bg-white/70 backdrop-blur-sm h-12 focus:border-emerald-400 focus:ring-emerald-300">
                <SelectValue placeholder="국가" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-emerald-100 rounded-2xl">
                <SelectItem value="all" className="rounded-xl">모든 국가</SelectItem>
                <SelectItem value="미국" className="rounded-xl">🇺🇸 미국</SelectItem>
                <SelectItem value="일본" className="rounded-xl">🇯🇵 일본</SelectItem>
                <SelectItem value="유럽" className="rounded-xl">🇪🇺 유럽</SelectItem>
                <SelectItem value="중국" className="rounded-xl">🇨🇳 중국</SelectItem>
                <SelectItem value="동남아" className="rounded-xl">🌏 동남아</SelectItem>
                <SelectItem value="기타" className="rounded-xl">🌍 기타</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-emerald-200/50 rounded-2xl bg-white/70 backdrop-blur-sm h-12 focus:border-emerald-400 focus:ring-emerald-300">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-emerald-100 rounded-2xl">
                <SelectItem value="latest" className="rounded-xl">최신순</SelectItem>
                <SelectItem value="popular" className="rounded-xl flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  인기순
                </SelectItem>
                <SelectItem value="deadline" className="rounded-xl">마감일순</SelectItem>
                <SelectItem value="price_low" className="rounded-xl">낮은 가격순</SelectItem>
                <SelectItem value="price_high" className="rounded-xl">높은 가격순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}