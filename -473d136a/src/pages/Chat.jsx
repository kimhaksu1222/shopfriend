
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react'; // Removed Zap as it's no longer relevant for the active chat UI

export default function ChatPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Main chat card */}
        <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl flex flex-col h-[70vh] md:h-[80vh] overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="border-b border-gray-200 p-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex-1 text-left">
              여행자 님 (예시 채팅)
            </CardTitle>
            {/* You could add more icons here for video call, info, etc. */}
          </CardHeader>

          {/* Chat Messages Area */}
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Example messages - In a real application, these would be mapped from a messages array */}
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[70%]">
                <p className="text-sm text-gray-800">안녕하세요! 여행 계획 잘 보고 있습니다.</p>
                <span className="text-xs text-gray-500 mt-1 block text-right">오전 10:30</span>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[70%]">
                <p className="text-sm">네, 감사합니다! 궁금한 점 있으시면 언제든지 말씀해주세요.</p>
                <span className="text-xs text-blue-100 mt-1 block text-right">오전 10:32</span>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[70%]">
                <p className="text-sm text-gray-800">네, 식사 옵션에 대해 좀 더 여쭤보고 싶습니다.</p>
                <span className="text-xs text-gray-500 mt-1 block text-right">오전 10:35</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[70%]">
                <p className="text-sm">어떤 옵션이 궁금하신가요? 한식, 양식, 아니면 특정 메뉴를 찾으시나요?</p>
                <span className="text-xs text-blue-100 mt-1 block text-right">오전 10:37</span>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[70%]">
                <p className="text-sm text-gray-800">현지 식당 중 추천해주실 만한 곳이 있을까요?</p>
                <span className="text-xs text-gray-500 mt-1 block text-right">오전 10:40</span>
              </div>
            </div>
          </CardContent>

          {/* Message Input and Send Button */}
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
            />
            <button className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shrink-0">
              전송
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
