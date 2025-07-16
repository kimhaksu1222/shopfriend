
import React, { useState, useEffect } from "react";
import { Request as RequestEntity } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { Report } from "@/api/entities";
import { Traveler } from "@/api/entities";
import { Post } from "@/api/entities"; // Import Post entity
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Users,
  BarChart3,
  ShoppingBag,
  Plane
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// AdminPage: No longer performs password check. Assumes access is granted via AdminAccessPage.
export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [travelers, setTravelers] = useState([]);
  const [posts, setPosts] = useState([]); // Add state for posts
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, reportsData, usersData, travelersData, postsData] = await Promise.all([
        RequestEntity.list("-created_date"),
        Report.list("-created_date"),
        UserEntity.list("-created_date"),
        Traveler.list("-created_date"),
        Post.list("-created_date") // Fetch posts
      ]);
      setRequests(requestsData);
      setReports(reportsData);
      setUsers(usersData);
      setTravelers(travelersData);
      setPosts(postsData); // Set posts state
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  // Action handlers (delete, update status, etc.)
  const handleDeleteRequest = async (requestId) => { /* ... */ };
  const handleUpdateRequestStatus = async (requestId, newStatus) => { /* ... */ };
  const handleProcessReport = async (reportId, action) => { /* ... */ };

  const handleDeletePost = async (postId) => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
        try {
            await Post.delete(postId);
            alert("게시글이 삭제되었습니다.");
            loadData();
        } catch(error) {
            console.error("게시글 삭제 실패:", error);
            alert("게시글 삭제에 실패했습니다.");
        }
    }
  };

  const handleUserAction = async (userId, action) => {
    alert(`User action '${action}' for ${userId} is not implemented yet.`);
  };

  const filteredRequests = requests.filter(request =>
    (request.product_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (request.created_by?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.nickname?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (post.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (post.author_nickname?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600">콘텐츠 관리, 사용자 및 서비스 현황</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger value="stats">통계</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="requests">요청 관리</TabsTrigger>
            <TabsTrigger value="posts">게시글 관리</TabsTrigger>
            <TabsTrigger value="reports">신고 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader><CardTitle>서비스 현황</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg"><p>총 사용자</p><p className="text-2xl font-bold">{users.length}명</p></div>
                  <div className="p-4 bg-gray-100 rounded-lg"><p>총 요청</p><p className="text-2xl font-bold">{requests.length}건</p></div>
                  <div className="p-4 bg-gray-100 rounded-lg"><p>총 여행자 등록</p><p className="text-2xl font-bold">{travelers.length}건</p></div>
                  <div className="p-4 bg-gray-100 rounded-lg"><p>처리 대기 신고</p><p className="text-2xl font-bold">{reports.filter(r => r.status === '접수').length}건</p></div>
                  <div className="p-4 bg-gray-100 rounded-lg"><p>총 게시글</p><p className="text-2xl font-bold">{posts.length}건</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader><CardTitle>사용자 관리</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded-md">
                    <div>
                      <p className="font-bold">{user.nickname || user.full_name} ({user.email})</p>
                      <p className="text-sm text-gray-500">가입일: {format(new Date(user.created_date), "yyyy-MM-dd")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, 'suspend')}>계정 정지</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, 'delete')}>삭제</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
             {/* 기존 요청 관리 UI */}
             <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle>요청 관리</CardTitle>
                  <div className="relative mt-2">
                    <Input
                      type="text"
                      placeholder="요청 검색 (상품명, 요청자)"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <p>로딩 중...</p>
                  ) : filteredRequests.length === 0 ? (
                    <p>표시할 요청이 없습니다.</p>
                  ) : (
                    filteredRequests.map(request => (
                      <div key={request.id} className="p-3 border rounded-md bg-white flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{request.product_name}</p>
                          <p className="text-sm text-gray-600">요청자: {request.created_by}</p>
                          <p className="text-xs text-gray-500">생성일: {format(new Date(request.created_date), "yyyy-MM-dd HH:mm", { locale: ko })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              request.status === '대기' ? 'secondary' :
                              request.status === '처리 중' ? 'default' :
                              request.status === '완료' ? 'outline' : 'destructive'
                            }
                          >
                            {request.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateRequestStatus(request.id, request.status === '대기' ? '처리 중' : '대기')}
                          >
                            상태 변경
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle>커뮤니티 게시글 관리</CardTitle>
                <div className="relative mt-2">
                    <Input
                      type="text"
                      placeholder="게시글 검색 (제목, 내용, 작성자)"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                    <p>로딩 중...</p>
                ) : filteredPosts.length === 0 ? (
                    <p>표시할 게시글이 없습니다.</p>
                ) : (
                  filteredPosts.map(post => (
                    <div key={post.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>작성자: {post.author_nickname || post.created_by?.split('@')[0]}</span>
                          <span>작성일: {format(new Date(post.created_date), "yyyy-MM-dd HH:mm")}</span>
                          <span>👁 {post.views || 0}</span>
                          <span>❤️ {post.likes || 0}</span>
                          <span>💬 {post.comments_count || 0}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePost(post.id)}
                        className="ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
             {/* 기존 신고 관리 UI */}
             <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle>신고 관리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <p>로딩 중...</p>
                  ) : reports.length === 0 ? (
                    <p>표시할 신고가 없습니다.</p>
                  ) : (
                    reports.map(report => (
                      <div key={report.id} className="p-3 border rounded-md bg-white flex justify-between items-center">
                        <div>
                          <p className="font-semibold">신고 유형: {report.type}</p>
                          <p className="text-sm text-gray-600">대상 ID: {report.target_id}</p>
                          <p className="text-xs text-gray-500">신고일: {format(new Date(report.created_date), "yyyy-MM-dd HH:mm", { locale: ko })}</p>
                          <p className="text-xs text-gray-500">내용: {report.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              report.status === '접수' ? 'secondary' :
                              report.status === '처리 중' ? 'default' :
                              report.status === '완료' ? 'outline' : 'destructive'
                            }
                          >
                            {report.status}
                          </Badge>
                          {report.status === '접수' && (
                            <Button variant="outline" size="sm" onClick={() => handleProcessReport(report.id, '처리 중')}>
                              <Eye className="h-4 w-4 mr-1" /> 처리 시작
                            </Button>
                          )}
                          {report.status === '처리 중' && (
                            <>
                              <Button variant="default" size="sm" onClick={() => handleProcessReport(report.id, '완료')}>
                                <CheckCircle className="h-4 w-4 mr-1" /> 완료
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleProcessReport(report.id, '반려')}>
                                <XCircle className="h-4 w-4 mr-1" /> 반려
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
