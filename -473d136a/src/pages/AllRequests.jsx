import React, { useState, useEffect } from "react";
import { Request as RequestEntity } from "@/api/entities";
import { User } from "@/api/entities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import RequestCard from "../components/home/RequestCard";
import { ArrowUpDown, Clock, Star, Eye, Search, Filter, MoreVertical, Trash2, Edit } from "lucide-react";

export default function AllRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [sortedRequests, setSortedRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

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
    filterAndSortRequests();
  }, [requests, sortBy, searchTerm, selectedCountry]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const [data, currentUser] = await Promise.all([
        RequestEntity.list(),
        User.me().catch(() => null)
      ]);
      setRequests(data);
      setUser(currentUser);
    } catch (error) {
      console.error("요청 목록 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("정말로 이 요청을 삭제하시겠습니까?")) {
      try {
        await RequestEntity.delete(requestId);
        alert("요청이 삭제되었습니다.");
        loadRequests();
      } catch (error) {
        console.error("요청 삭제 실패:", error);
        alert("요청 삭제에 실패했습니다.");
      }
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];
    
    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 국가 필터
    if (selectedCountry !== "all") {
      filtered = filtered.filter(request => request.country === selectedCountry);
    }
    
    // 정렬
    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "name":
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case "views":
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "wishlist":
        filtered.sort((a, b) => (b.interest_count || 0) - (a.interest_count || 0));
        break;
      default:
        break;
    }
    setSortedRequests(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">전체 요청 ({sortedRequests.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="제품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="국가" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 국가</SelectItem>
                  <SelectItem value="미국">🇺🇸 미국</SelectItem>
                  <SelectItem value="일본">🇯🇵 일본</SelectItem>
                  <SelectItem value="유럽">🇪🇺 유럽</SelectItem>
                  <SelectItem value="중국">🇨🇳 중국</SelectItem>
                  <SelectItem value="동남아">🌏 동남아</SelectItem>
                  <SelectItem value="기타">🌍 기타</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      최신순
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      이름순
                    </div>
                  </SelectItem>
                  <SelectItem value="views">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      조회순
                    </div>
                  </SelectItem>
                  <SelectItem value="wishlist">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      찜순
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg p-2 space-y-2">
                  <div className="h-24 bg-gray-200 rounded-md"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchTerm || selectedCountry !== "all" ? "검색 결과가 없습니다" : "등록된 요청이 없습니다"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCountry !== "all" ? "다른 조건으로 검색해보세요" : "첫 번째 요청을 등록해보세요!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedRequests.map((request) => (
              <div key={request.id} className="relative group">
                <RequestCard request={request} />
                {user && (user.email === request.created_by || user.role === 'admin') && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur-sm shadow-lg">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.email === request.created_by && (
                          <DropdownMenuItem onClick={() => {
                            // 수정 기능은 나중에 구현
                            alert("수정 기능은 준비 중입니다.");
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}