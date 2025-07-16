import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Post } from "@/api/entities";
import { Comment } from "@/api/entities";
import { PostLike } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Users2, 
  MessageSquare, 
  TrendingUp, 
  Star,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  Eye,
  Clock,
  Send,
  Heart,
  MessageCircle,
  Sparkles,
  Pin,
  MoreVertical,
  Trash2,
  Edit
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CommunityPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteDialog, setShowWriteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: ""
  });

  const categories = [
    { name: "전체", value: "all", count: 0, color: "bg-gray-100 text-gray-800", emoji: "🌟" },
    { name: "여행꿀팁", value: "여행꿀팁", count: 0, color: "bg-blue-100 text-blue-800", emoji: "✈️" },
    { name: "후기공유", value: "후기공유", count: 0, color: "bg-green-100 text-green-800", emoji: "💝" },
    { name: "질문답변", value: "질문답변", count: 0, color: "bg-orange-100 text-orange-800", emoji: "❓" },
    { name: "감사인사", value: "감사인사", count: 0, color: "bg-purple-100 text-purple-800", emoji: "🙏" },
    { name: "정보공유", value: "정보공유", count: 0, color: "bg-indigo-100 text-indigo-800", emoji: "📋" },
    { name: "자유게시판", value: "자유게시판", count: 0, color: "bg-pink-100 text-pink-800", emoji: "💬" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, selectedCategory, searchTerm, sortBy]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, postsData] = await Promise.all([
        User.me(),
        Post.list("-created_date")
      ]);
      setUser(currentUser);
      setPosts(postsData);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // 카테고리 필터
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "popular":
        filtered.sort((a, b) => {
          const scoreA = (a.likes || 0) * 3 + (a.views || 0) + (a.comments_count || 0) * 2;
          const scoreB = (b.likes || 0) * 3 + (b.views || 0) + (b.comments_count || 0) * 2;
          return scoreB - scoreA;
        });
        break;
      case "views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    // 고정 게시글을 맨 위로
    filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });

    setFilteredPosts(filtered);
  };

  const handleWritePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await Post.create({
        ...newPost,
        author_nickname: user.nickname || user.full_name
      });
      setNewPost({ title: "", content: "", category: "" });
      setShowWriteDialog(false);
      loadData();
      alert("게시글이 작성되었습니다!");
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await Post.delete(postId);
        alert("게시글이 삭제되었습니다.");
        loadData();
      } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const existingLike = await PostLike.filter({ post_id: postId, user_email: user.email });
      
      if (existingLike.length > 0) {
        await PostLike.delete(existingLike[0].id);
        await Post.update(postId, { likes: Math.max(0, posts.find(p => p.id === postId).likes - 1) });
      } else {
        await PostLike.create({ post_id: postId, user_email: user.email });
        await Post.update(postId, { likes: (posts.find(p => p.id === postId).likes || 0) + 1 });
      }
      
      loadData();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleViewPost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      await Post.update(postId, { views: (post.views || 0) + 1 });
      navigate(createPageUrl(`PostDetail?id=${postId}`));
    } catch (error) {
      console.error("조회수 업데이트 실패:", error);
      navigate(createPageUrl(`PostDetail?id=${postId}`));
    }
  };

  const getCategoryData = () => {
    return categories.map(cat => ({
      ...cat,
      count: cat.value === "all" ? posts.length : posts.filter(p => p.category === cat.value).length
    }));
  };

  const renderProfilePicture = (profileUrl, authorNickname) => {
    if (profileUrl) {
      if (profileUrl.startsWith('emoji:')) {
        const emoji = profileUrl.replace('emoji:', '');
        return (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-sm">
            {emoji}
          </div>
        );
      } else {
        return <AvatarImage src={profileUrl} alt={authorNickname} />;
      }
    }
    return (
      <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">
        {authorNickname?.charAt(0)?.toUpperCase() || 'U'}
      </AvatarFallback>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
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
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">숍프렌드 커뮤니티</h1>
              <p className="text-gray-600">함께 나누는 해외쇼핑 이야기 💝</p>
            </div>
          </div>
          
          <Dialog open={showWriteDialog} onOpenChange={setShowWriteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                글쓰기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  새 게시글 작성
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.value !== "all").map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="제목을 입력하세요"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="text-lg font-medium"
                />
                
                <Textarea
                  placeholder="내용을 입력하세요..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="h-40 resize-none"
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowWriteDialog(false)}>
                    취소
                  </Button>
                  <Button onClick={handleWritePost} className="bg-purple-500 hover:bg-purple-600">
                    <Send className="w-4 h-4 mr-2" />
                    작성하기
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 카테고리 */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-500" />
                  카테고리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getCategoryData().map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                      selectedCategory === category.value
                        ? 'bg-purple-100 border-2 border-purple-300'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.emoji}</span>
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </div>
                    <Badge className={category.color}>{category.count}</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* 커뮤니티 통계 */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">전체 게시글</span>
                  <span className="font-bold text-purple-600">{posts.length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">오늘 작성</span>
                  <span className="font-bold text-green-600">
                    {posts.filter(p => {
                      const today = new Date().toDateString();
                      const postDate = new Date(p.created_date).toDateString();
                      return today === postDate;
                    }).length}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">총 좋아요</span>
                  <span className="font-bold text-pink-600">
                    {posts.reduce((sum, p) => sum + (p.likes || 0), 0)}개
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 검색 및 정렬 */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="게시글을 검색해보세요..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 rounded-2xl"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">최신순</SelectItem>
                      <SelectItem value="popular">인기순</SelectItem>
                      <SelectItem value="views">조회순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 게시글 목록 */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
                    <p className="text-gray-500">첫 번째 게시글을 작성해보세요!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-3xl hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleViewPost(post.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {post.is_pinned && (
                            <Pin className="w-4 h-4 text-orange-500" />
                          )}
                          <Badge className={categories.find(c => c.value === post.category)?.color || "bg-gray-100 text-gray-800"}>
                            {categories.find(c => c.value === post.category)?.emoji} {post.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ko })}
                          </span>
                          {user && (user.email === post.created_by || user.role === 'admin') && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.email === post.created_by && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    // 수정 기능은 나중에 구현
                                    alert("수정 기능은 준비 중입니다.");
                                  }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    수정
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikePost(post.id);
                            }}
                            className="flex items-center gap-1 hover:text-pink-600 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            {post.likes || 0}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            {renderProfilePicture(post.author_profile_picture_url, post.author_nickname)}
                          </Avatar>
                          <span className="text-sm font-medium text-gray-700">
                            {post.author_nickname || post.created_by?.split('@')[0]}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}