
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ChatRoom } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Mail, AlertCircle } from "lucide-react"; // Added AlertCircle
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function ChatListPage() {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // Added errorMessage state

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Ensure loading state is true at the start
      setErrorMessage(""); // Clear any previous error messages
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const roomsAsRequestor = await ChatRoom.filter({ requestor_email: user.email });
        const roomsAsTraveler = await ChatRoom.filter({ traveler_email: user.email });
        
        const allRooms = [...roomsAsRequestor, ...roomsAsTraveler];
        // 중복 제거
        const uniqueRooms = Array.from(new Map(allRooms.map(item => [item.id, item])).values());
        
        uniqueRooms.sort((a, b) => 
          new Date(b.last_message_timestamp || b.updated_date) - new Date(a.last_message_timestamp || a.updated_date)
        );

        setChatRooms(uniqueRooms);
      } catch (error) {
        console.error("채팅 목록 로드 실패:", error);
        // Improved error handling based on error message or status code
        if (error.message && error.message.includes('429')) {
             setErrorMessage("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        } else {
            setErrorMessage("채팅 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getOtherUserEmail = (room) => {
    // Added null/undefined checks for currentUser and room
    if (!currentUser || !room) return ""; 
    return currentUser.email === room.requestor_email ? room.traveler_email : room.requestor_email;
  };
  
  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">채팅 목록 로딩 중...</h1>
      </div>
    );
  }

  // Display error message if there's an error
  if (errorMessage) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">오류 발생</h1>
        <p className="text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <MessageSquare className="w-7 h-7 text-blue-500" />
              내 채팅 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chatRooms.length > 0 ? (
              <div className="space-y-3">
                {chatRooms.map(room => (
                  <Link to={createPageUrl(`ChatRoom?id=${room.id}`)} key={room.id} className="block group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg border border-gray-100">
                      <Avatar className="w-12 h-12 border-2 border-blue-200">
                        {/* Added optional chaining for .toUpperCase() */}
                        <AvatarFallback>{getOtherUserEmail(room)?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-gray-800 truncate">{getOtherUserEmail(room)}</p>
                          <p className="text-xs text-gray-500">
                            {room.last_message_timestamp && formatDistanceToNow(new Date(room.last_message_timestamp), { addSuffix: true, locale: ko })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          <span className="font-medium text-blue-600">[{room.product_name}]</span> {room.last_message || "아직 메시지가 없습니다."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                 <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">채팅방이 없습니다.</h3>
                <p className="text-gray-500 mt-2">여행자 또는 요청자와 대화를 시작해보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
