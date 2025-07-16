import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Post } from "@/api/entities";
import { Comment } from "@/api/entities";
import { User } from "@/api/entities";
import { Report } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
  Send,
  Flag,
  AlertTriangle,
  Shield,
  ThumbsUp,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { createPageUrl } from "@/utils";

export default function PostDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get('id');
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [isCheckingComment, setIsCheckingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPostData();
    }
  }, [postId]);

  const loadPostData = async () => {
    setIsLoading(true);
    try {
      const [postData, commentsData, currentUser] = await Promise.all([
        Post.filter({ id: postId }),
        Comment.filter({ post_id: postId }, "-created_date"),
        User.me().catch(() => null)
      ]);

      if (postData && postData.length > 0) {
        const currentPost = postData[0];
        setPost(currentPost);
        
        // 조회수 증가
        await Post.update(postId, { 
          views: (currentPost.views || 0) + 1 
        });
      }
      
      setComments(commentsData || []);
      setUser(currentUser);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    }
    setIsLoading(false);
  };

  const checkCommentWithAI = async (content) => {
    try {
      const result = await InvokeLLM({
        prompt: `
          다음 댓글 내용을 분석해서 욕설, 비방, 혐오 표현이 포함되어 있는지 확인해줘:
          "${content}"
          
          욕설이나 부적절한 내용이 포함되어 있으면 true, 정상적인 댓글이면 false를 반환해줘.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            is_inappropriate: { type: "boolean", description: "부적절한 내용 포함 여부" },
            reason: { type: "string", description: "부적절한 이유 (해당시)" }
          },
          required: ["is_inappropriate"]
        }
      });

      return result;
    } catch (error) {
      console.error("AI 욕설 필터링 실패:", error);
      return { is_inappropriate: false };
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) {
      alert("댓글을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setIsCheckingComment(true);

    try {
      // AI 욕설 필터링
      const aiCheck = await checkCommentWithAI(newComment);
      
      if (aiCheck.is_inappropriate) {
        alert("🚫 부적절한 내용이 포함된 댓글은 작성할 수 없습니다.");
        setIsSubmitting(false);
        setIsCheckingComment(false);
        return;
      }

      setIsCheckingComment(false);

      await Comment.create({
        post_id: postId,
        content: newComment,
        author_nickname: user.nickname || user.full_name,
        author_profile_picture_url: user.profile_picture_url
      });

      // 댓글 수 업데이트
      await Post.update(postId, {
        comments_count: (post.comments_count || 0) + 1
      });

      setNewComment("");
      loadPostData();
      alert("✅ 댓글이 성공적으로 작성되었습니다!");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
    setIsSubmitting(false);
  };

  const handleLikePost = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await Post.update(postId, {
        likes: (post.likes || 0) + 1
      });
      loadPostData();
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const handleReport = async () => {
    if (!reportType || !reportDescription.trim()) {
      alert("신고 사유와 상세 내용을 모두 입력해주세요.");
      return;
    }

    try {
      await Report.create({
        reported_type: reportTarget?.type || "게시글",
        reported_id: reportTarget?.id || postId,
        reason: reportType,
        description: reportDescription
      });

      alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
      setShowReportDialog(false);
      setReportType("");
      setReportDescription("");
      setReportTarget(null);
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고 접수에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderProfilePicture = (profileUrl) => {
    if (profileUrl) {
      if (profileUrl.startsWith('emoji:')) {
        const emoji = profileUrl.replace('emoji:', '');
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-lg">
            {emoji}
          </div>
        );
      } else {
        return <AvatarImage src={profileUrl} alt="Profile" />;
      }
    }
    return <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">U</AvatarFallback>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">삭제되었거나 존재하지 않는 게시글입니다.</p>
          <Button onClick={() => navigate(createPageUrl("Community"))}>
            커뮤니티로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  const categories = {
    "여행꿀팁": { color: "bg-blue-100 text-blue-800", emoji: "✈️" },
    "후기공유": { color: "bg-green-100 text-green-800", emoji: "💝" },
    "질문답변": { color: "bg-orange-100 text-orange-800", emoji: "❓" },
    "감사인사": { color: "bg-purple-100 text-purple-800", emoji: "🙏" },
    "정보공유": { color: "bg-indigo-100 text-indigo-800", emoji: "📋" },
    "자유게시판": { color: "bg-pink-100 text-pink-800", emoji: "💬" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Community"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">게시글 상세</h1>
        </div>

        {/* 게시글 카드 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge className={categories[post.category]?.color || "bg-gray-100 text-gray-800"}>
                  {categories[post.category]?.emoji} {post.category}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ko })}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => {
                      setReportTarget({ type: "게시글", id: postId });
                      setShowReportDialog(true);
                    }}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    신고하기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
              {post.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikePost}
                  className="flex items-center gap-2 text-pink-600 hover:bg-pink-50"
                >
                  <Heart className="w-4 h-4" />
                  {post.likes || 0}
                </Button>
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments_count || 0}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  {post.views || 0}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  {renderProfilePicture(post.author_profile_picture_url)}
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {post.author_nickname || post.created_by?.split('@')[0]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 작성 */}
        {user && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8">
                  {renderProfilePicture(user.profile_picture_url)}
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="댓글을 작성해보세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {isCheckingComment && (
                        <>
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>AI가 댓글을 검토 중...</span>
                        </>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isCheckingComment ? "검토 중..." : "작성 중..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          댓글 작성
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 댓글 목록 */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              댓글 ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>첫 번째 댓글을 작성해보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      {renderProfilePicture(comment.author_profile_picture_url)}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {comment.author_nickname || comment.created_by?.split('@')[0]}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: ko })}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setReportTarget({ type: "댓글", id: comment.id });
                                setShowReportDialog(true);
                              }}
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              신고하기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 신고 다이얼로그 */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                신고하기
              </DialogTitle>
              <DialogDescription>
                부적절한 콘텐츠를 신고해주세요. 신중히 검토한 후 조치하겠습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="신고 사유를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="스팸">스팸</SelectItem>
                  <SelectItem value="욕설">욕설/비방</SelectItem>
                  <SelectItem value="부적절한내용">부적절한 내용</SelectItem>
                  <SelectItem value="사기">사기 의심</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="상세한 신고 내용을 입력해주세요..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                취소
              </Button>
              <Button onClick={handleReport} className="bg-red-500 hover:bg-red-600">
                신고하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}