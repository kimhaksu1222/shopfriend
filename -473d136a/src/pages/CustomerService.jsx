import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LifeBuoy,
  Phone,
  MessageSquare,
  FileText,
  Bell,
  Send,
} from "lucide-react";

const faqData = [
  {
    question: "숍프렌드는 어떤 서비스인가요?",
    answer:
      "숍프렌드는 해외 여행자와 국내 구매자를 연결하여 원하는 해외 제품을 쉽고 안전하게 구매할 수 있도록 돕는 P2P 해외 쇼핑 중개 플랫폼입니다.",
  },
  {
    question: "거래는 어떻게 이루어지나요?",
    answer:
      "구매자가 원하는 제품을 요청하면, 해당 국가를 여행하는 여행자가 요청을 수락하고 제품을 대신 구매해줍니다. 두 사용자는 채팅을 통해 가격, 수수료, 배송 방법을 협의하고 거래를 진행합니다.",
  },
  {
    question: "수수료는 어떻게 되나요?",
    answer:
      "여행자 수수료는 구매자와 여행자 간의 협의를 통해 결정됩니다. 숍프렌드는 안전한 거래 환경을 제공하며, 현재 별도의 플랫폼 수수료는 없습니다.",
  },
  {
    question: "안전한 거래를 위해 무엇을 해야 하나요?",
    answer:
      "거래 전 상대방의 프로필, 평점, 여행 인증 배지 등을 확인하세요. 모든 대화와 협의는 숍프렌드 채팅을 통해 기록으로 남기는 것이 좋습니다. 문제가 발생할 경우, 신고 기능을 통해 고객센터에 도움을 요청할 수 있습니다.",
  },
];

export default function CustomerServicePage() {
  const [reportData, setReportData] = useState({
    type: "",
    content: "",
  });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    alert("신고가 접수되었습니다.");
    // 여기에 실제 신고 로직 추가
    setReportData({ type: "", content: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-teal-500 rounded-xl flex items-center justify-center">
            <LifeBuoy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">고객센터</h1>
            <p className="text-gray-600">무엇을 도와드릴까요?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 공지사항 & 연락처 */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  공지사항
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">🎉 숍프렌드 MVP 오픈!</h3>
                    <p className="text-sm text-gray-600 mt-1">새로운 해외쇼핑 플랫폼이 오픈했습니다.</p>
                    <p className="text-xs text-gray-500 mt-2">2025.08.01</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">✈️ 첫거래 이벤트</h3>
                    <p className="text-sm text-gray-600 mt-1">스타벅스 쿠폰받아가세요!</p>
                    <p className="text-xs text-gray-500 mt-2">2024.01.10</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-500" />
                  연락처 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium">이메일:</span> rlagkrtn981229@naver.com </p>
                  <p><span className="font-medium">운영시간:</span> 평일 09:00 - 18:00 (주말, 공휴일 휴무)</p>
                  <p><span className="font-medium">평균 응답시간:</span> 1-2시간내 영업일</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: FAQ & 신고 */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  자주 묻는 질문 (FAQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  문의 및 신고
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="문의 종류 또는 신고 대상"
                    value={reportData.type}
                    onChange={(e) =>
                      setReportData({ ...reportData, type: e.target.value })
                    }
                    required
                  />
                  <Textarea
                    placeholder="상세 내용을 입력해주세요."
                    value={reportData.content}
                    onChange={(e) =>
                      setReportData({ ...reportData, content: e.target.value })
                    }
                    className="h-32"
                    required
                  />
                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-teal-500 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    제출하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}