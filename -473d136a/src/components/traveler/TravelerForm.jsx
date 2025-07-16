
import React, { useState } from "react";
import { Traveler } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Calendar, 
  Plane, 
  Package, 
  MessageCircle,
  CheckCircle,
  X,
  Flag
} from "lucide-react";

export default function TravelerForm({ onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    departure_date: "",
    return_date: "",
    max_weight: "",
    contact_info: "",
    nationality: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.country || !formData.nationality || !formData.departure_date || !formData.return_date || !formData.contact_info) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Traveler.create({
        ...formData,
        max_weight: formData.max_weight ? parseFloat(formData.max_weight) : null
      });
      
      alert("여행 일정이 성공적으로 등록되었습니다!");
      onSuccess();
    } catch (error) {
      console.error("여행 등록 실패:", error);
      alert("여행 등록에 실패했습니다. 다시 시도해주세요.");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plane className="w-6 h-6 text-slate-800" />
            새 여행 등록
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                국가 *
              </Label>
              <Input
                id="country"
                placeholder="예: 일본"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="nationality" className="text-sm font-medium flex items-center gap-2">
                <Flag className="w-4 h-4" />
                국적 *
              </Label>
              <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="한국">한국</SelectItem>
                  <SelectItem value="미국">미국</SelectItem>
                  <SelectItem value="일본">일본</SelectItem>
                  <SelectItem value="중국">중국</SelectItem>
                  <SelectItem value="캐나다">캐나다</SelectItem>
                  <SelectItem value="호주">호주</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="city" className="text-sm font-medium">
                도시
              </Label>
              <Input
                id="city"
                placeholder="예: 뉴욕, 도쿄"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                출국일 *
              </Label>
              <Input
                id="departure_date"
                type="date"
                value={formData.departure_date}
                onChange={(e) => handleInputChange("departure_date", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="return_date" className="text-sm font-medium">
                귀국일 *
              </Label>
              <Input
                id="return_date"
                type="date"
                value={formData.return_date}
                onChange={(e) => handleInputChange("return_date", e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max_weight" className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              최대 휴대 가능 무게 (kg)
            </Label>
            <Input
              id="max_weight"
              type="number"
              placeholder="예: 10"
              value={formData.max_weight}
              onChange={(e) => handleInputChange("max_weight", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="contact_info" className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              연락처 *
            </Label>
            <Input
              id="contact_info"
              placeholder="전화번호 또는 오픈채팅 링크"
              value={formData.contact_info}
              onChange={(e) => handleInputChange("contact_info", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              {isSubmitting ? (
                "등록 중..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  등록하기
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
