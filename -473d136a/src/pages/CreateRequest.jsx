
import React, { useState, useEffect } from "react";
import { Request as RequestEntity } from "@/api/entities";
import { UploadFile, InvokeLLM, GenerateImage } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ShoppingBag,
  Upload,
  ArrowLeft,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Truck,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle,
  Handshake,
  Plus,
  X,
  Store,
  Sparkles,
  Loader2,
  HelpCircle,
  Info,
  ChevronsUpDown,
  Check
} from "lucide-react";

const citiesByCountry = {
  "미국": ["뉴욕", "로스앤젤레스", "시카고", "샌프란시스코", "라스베이거스", "워싱턴 D.C.", "보스턴", "시애틀", "기타"],
  "일본": ["도쿄", "오사카", "후쿠오카", "삿포로", "교토", "나고야", "요코하마", "고베", "기타"],
  "유럽": ["파리", "런던", "로마", "베를린", "마드리드", "바르셀로나", "프라하", "암스테르담", "기타"],
  "중국": ["베이징", "상하이", "광저우", "심천", "항저우", "청두", "난징", "시안", "기타"],
  "동남아": ["방콕", "싱가포르", "하노이", "쿠알라룸푸르", "마닐라", "자카르타", "호치민", "기타"],
  "캐나다": ["토론토", "밴쿠버", "몬트리올", "캘거리", "오타와", "기타"],
  "호주": ["시드니", "멜버른", "브리즈번", "퍼스", "애들레이드", "기타"],
  "기타": []
};

const countryList = [
    { value: "가나", label: "가나" },
    { value: "가봉", label: "가봉" },
    { value: "가이아나", label: "가이아나" },
    { value: "감비아", label: "감비아" },
    { value: "과테말라", label: "과테말라" },
    { value: "괌", label: "괌" },
    { value: "그레나다", label: "그레나다" },
    { value: "그리스", label: "그리스" },
    { value: "기니", label: "기니" },
    { value: "기니비사우", label: "기니비사우" },
    { value: "나미비아", label: "나미미아" },
    { value: "나우루", label: "나우루" },
    { value: "나이지리아", label: "나이지리아" },
    { value: "남수단", label: "남수단" },
    { value: "남아프리카 공화국", label: "남아프리카 공화국" },
    { value: "네덜란드", label: "네덜란드" },
    { value: "네팔", label: "네팔" },
    { value: "노르웨이", label: "노르웨이" },
    { value: "뉴질랜드", label: "뉴질랜드" },
    { value: "니제르", label: "니제르" },
    { value: "니카라과", label: "니카라과" },
    { value: "대한민국", label: "대한민국" },
    { value: "덴마크", label: "덴마크" },
    { value: "도미니카 공화국", label: "도미니카 공화국" },
    { value: "도미니카 연방", label: "도미니카 연방" },
    { value: "독일", label: "독일" },
    { value: "동티모르", label: "동티모르" },
    { value: "라오스", label: "라오스" },
    { value: "라이베리아", label: "라이베리아" },
    { value: "라트비아", label: "라트비아" },
    { value: "러시아", label: "러시아" },
    { value: "레바논", label: "레바논" },
    { value: "레소토", label: "레소토" },
    { value: "루마니아", label: "루마니아" },
    { value: "룩셈부르크", label: "룩셈부르크" },
    { value: "르완다", label: "르완다" },
    { value: "리비아", label: "리비아" },
    { value: "리투아니아", label: "리투아니아" },
    { value: "리히텐슈타인", label: "리히텐슈타인" },
    { value: "마다가스카르", label: "마다가스카르" },
    { value: "마셜 제도", label: "마셜 제도" },
    { value: "말라위", label: "말라위" },
    { value: "말레이시아", label: "말레이시아" },
    { value: "말리", label: "말리" },
    { value: "멕시코", label: "멕시코" },
    { value: "모나코", label: "모나코" },
    { value: "모로코", label: "모로코" },
    { value: "모리셔스", label: "모리셔스" },
    { value: "모리타니", label: "모리타니" },
    { value: "모잠비크", label: "모잠비크" },
    { value: "몬테네그로", label: "몬테네그로" },
    { value: "몰도바", label: "몰도바" },
    { value: "몰디브", label: "몰디브" },
    { value: "몰타", label: "몰타" },
    { value: "몽골", label: "몽골" },
    { value: "미국", label: "미국" },
    { value: "미얀마", label: "미얀마" },
    { value: "미크로네시아 연방", label: "미크로네시아 연방" },
    { value: "바누아투", label: "바누아투" },
    { value: "바레인", label: "바레인" },
    { value: "바베이도스", label: "바베이도스" },
    { value: "바티칸 시국", label: "바티칸 시국" },
    { value: "바하마", label: "바하마" },
    { value: "방글라데시", label: "방글라데시" },
    { value: "베냉", label: "베냉" },
    { value: "베네수엘라", label: "베네수엘라" },
    { value: "베트남", label: "베트남" },
    { value: "벨기에", label: "벨기에" },
    { value: "벨라루스", label: "벨라루스" },
    { value: "벨리즈", label: "벨리즈" },
    { value: "보스니아 헤르체고비나", label: "보스니아 헤르체고비나" },
    { value: "보츠와나", label: "보츠와나" },
    { value: "볼리비아", label: "볼리비아" },
    { value: "부룬디", label: "부룬디" },
    { value: "부르키나파소", label: "부르키나파소" },
    { value: "부탄", label: "부탄" },
    { value: "북마케도니아", label: "북마케도니아" },
    { value: "불가리아", label: "불가리아" },
    { value: "브라질", label: "브라질" },
    { value: "브루나이", label: "브루나이" },
    { value: "사모아", label: "사모아" },
    { value: "사우디아라비아", label: "사우디아라비아" },
    { value: "산마리노", label: "산마리노" },
    { value: "상투메 프린시페", label: "상투메 프린시페" },
    { value: "세네갈", label: "세네갈" },
    { value: "세르비아", label: "세르비아" },
    { value: "세이셸", label: "세이셸" },
    { value: "세인트루시아", label: "세인트루시아" },
    { value: "세인트빈센트 그레나딘", label: "세인트빈센트 그레나딘" },
    { value: "세인트키츠 네비스", label: "세인트키츠 네비스" },
    { value: "소말리아", label: "소말리아" },
    { value: "솔로몬 제도", label: "솔로몬 제도" },
    { value: "수단", label: "수단" },
    { value: "수리남", label: "수리남" },
    { value: "스리랑카", label: "스리랑카" },
    { value: "스웨덴", label: "스웨덴" },
    { value: "스위스", label: "스위스" },
    { value: "스페인", label: "스페인" },
    { value: "슬로바키아", label: "슬로바키아" },
    { value: "슬로베니아", label: "슬로베니아" },
    { value: "시리아", label: "시리아" },
    { value: "시에라리온", label: "시에라리온" },
    { value: "싱가포르", label: "싱가포르" },
    { value: "아랍에미리트", label: "아랍에미리트" },
    { value: "아르메니아", label: "아르메니아" },
    { value: "아르헨티나", label: "아르헨티나" },
    { value: "아이슬란드", label: "아이슬란드" },
    { value: "아이티", label: "아이티" },
    { value: "아일랜드", label: "아일랜드" },
    { value: "아제르바이잔", label: "아제르바이잔" },
    { value: "아프가니스탄", label: "아프가니스탄" },
    { value: "안도라", label: "안도라" },
    { value: "알바니아", label: "알바니아" },
    { value: "알제리", label: "알제리" },
    { value: "앙골라", label: "앙골라" },
    { value: "앤티가 바부다", label: "앤티가 바부다" },
    { value: "에리트레아", label: "에리트레아" },
    { value: "에스와티니", label: "에스와티니" },
    { value: "에스토니아", label: "에스토니아" },
    { value: "에콰도르", label: "에콰도르" },
    { value: "에티오피아", label: "에티오피아" },
    { value: "엘살바도르", label: "엘살바도르" },
    { value: "영국", label: "영국" },
    { value: "예멘", label: "예멘" },
    { value: "오만", label: "오만" },
    { value: "오스트리아", label: "오스트리아" },
    { value: "온두라스", label: "온두라스" },
    { value: "우간다", label: "우간다" },
    { value: "우루과이", label: "우루과이" },
    { value: "우즈베키스탄", label: "우즈베키스탄" },
    { value: "우크라이나", label: "우크라이나" },
    { value: "이란", label: "이란" },
    { value: "이집트", label: "이집트" },
    { value: "이탈리아", label: "이탈리아" },
    { value: "인도", label: "인도" },
    { value: "인도네시아", label: "인도네시아" },
    { value: "일본", label: "일본" },
    { value: "자메이카", label: "자메이카" },
    { value: "잠비아", label: "잠비아" },
    { value: "적도 기니", label: "적도 기니" },
    { value: "조지아", label: "조지아" },
    { value: "중앙아프리카 공화국", label: "중앙아프리카 공화국" },
    { value: "중국", label: "중국" },
    { value: "지부티", label: "지부티" },
    { value: "짐바브웨", label: "짐바브웨" },
    { value: "차드", label: "차드" },
    { value: "체코", label: "체코" },
    { value: "칠레", label: "칠레" },
    { value: "카메룬", label: "카메룬" },
    { value: "카보베르데", label: "카보베르데" },
    { value: "카자흐스탄", label: "카자흐스탄" },
    { value: "카타르", label: "카타르" },
    { value: "캄보디아", label: "캄보디아" },
    { value: "캐나다", label: "캐나다" },
    { value: "케냐", label: "케냐" },
    { value: "코모로", label: "코모로" },
    { value: "코스타리카", label: "코스타리카" },
    { value: "코트디부아르", label: "코트디부아르" },
    { value: "콜롬비아", label: "콜롬비아" },
    { value: "콩고 공화국", label: "콩고 공화국" },
    { value: "콩고 민주 공화국", label: "콩고 민주 공화국" },
    { value: "쿠바", label: "쿠바" },
    { value: "쿠웨이트", label: "쿠웨이트" },
    { value: "크로아티아", label: "크로아티아" },
    { value: "키르기스스탄", label: "키르기스스탄" },
    { value: "키리바시", label: "키리바시" },
    { value: "키프로스", label: "키프로스" },
    { value: "타지키스탄", label: "타지키스탄" },
    { value: "탄자니아", label: "탄자니아" },
    { value: "태국", label: "태국" },
    { value: "토고", label: "토고" },
    { value: "통가", label: "통가" },
    { value: "투르크메니스탄", label: "투르크메니스탄" },
    { value: "투발루", label: "투발루" },
    { value: "튀니지", label: "튀니지" },
    { value: "튀르키예", label: "튀르키예" },
    { value: "트리니다드 토바고", label: "트리니다드 토바고" },
    { value: "파나마", label: "파나마" },
    { value: "파라과이", label: "파라과이" },
    { value: "파키스탄", label: "파키스탄" },
    { value: "파푸아뉴기니", label: "파푸아뉴기니" },
    { value: "팔라우", label: "팔라우" },
    { value: "페루", label: "페루" },
    { value: "포르투갈", label: "포르투갈" },
    { value: "폴란드", label: "폴란드" },
    { value: "프랑스", label: "프랑스" },
    { value: "피지", label: "피지" },
    { value: "핀란드", label: "핀란드" },
    { value: "필리핀", label: "필리핀" },
    { value: "헝가리", label: "헝가리" },
    { value: "호주", label: "호주" },
];

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIImageButton, setShowAIImageButton] = useState(false);
  const [showPriceHelp, setShowPriceHelp] = useState(false);
  const [openCountryCombobox, setOpenCountryCombobox] = useState(false);
  const [openCityCombobox, setOpenCityCombobox] = useState(false);


  const [formData, setFormData] = useState({
    product_name: "",
    image_url: "",
    quantity: 1,
    target_price: "",
    service_fee: "",
    negotiable: false,
    description: "",
    deadline: "",
    country: "",
    city: "",
    delivery_method: "",
    contact_info: ""
  });
  const [purchaseLocations, setPurchaseLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [recommendedStores, setRecommendedStores] = useState([]); // New state for recommended stores
  const [showStoreSelection, setShowStoreSelection] = useState(false); // New state to control store selection dialog

  useEffect(() => {
    if (formData.country && citiesByCountry[formData.country]) {
      setCityOptions(citiesByCountry[formData.country]);
    } else {
      setCityOptions([]);
    }
    handleInputChange("city", "");
  }, [formData.country]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddLocation = () => {
    if (currentLocation.trim() && !purchaseLocations.includes(currentLocation.trim())) {
      setPurchaseLocations([...purchaseLocations, currentLocation.trim()]);
      setCurrentLocation("");
    }
  };

  const handleRemoveLocation = (locationToRemove) => {
    setPurchaseLocations(purchaseLocations.filter(loc => loc !== locationToRemove));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange("image_url", file_url);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    }
    setUploadingImage(false);
  };

  const handleAIImageGeneration = async () => {
    if (!formData.product_name) {
      alert("제품명을 먼저 입력해주세요.");
      return;
    }
    setIsGenerating(true);
    try {
      // 더 구체적이고 정확한 이미지 생성을 위한 프롬프트 개선
      const enhancedPrompt = `A high-quality, professional product photograph of "${formData.product_name}", shot in a clean studio environment with soft lighting, white background, realistic details, commercial photography style, sharp focus, no text or logos, centered composition`;
      
      const result = await GenerateImage({
        prompt: enhancedPrompt,
      });
      
      if (result && result.url) {
        handleInputChange("image_url", result.url);
        alert("🎉 AI가 제품에 맞는 이미지를 생성했습니다!");
      } else {
        throw new Error("AI가 이미지를 생성하지 못했습니다.");
      }
    } catch (error) {
      console.error("AI 이미지 생성 실패:", error);
      alert("AI 이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIStoreRecommendation = async () => {
    if (!formData.product_name || !formData.country) {
      alert("제품명과 구매 희망 국가를 먼저 입력해주세요.");
      return;
    }

    try {
      const prompt = `
        다음 정보를 바탕으로 제품을 구매할 수 있는 적합한 매장을 추천해주세요.
        
        제품명: ${formData.product_name}
        상세 설명: ${formData.description || '정보 없음'}
        구매 희망 국가: ${formData.country}
        구매 희망 도시: ${formData.city || '특정 도시 없음'}
        
        해당 제품을 판매할 가능성이 높은 매장을 최대 6개까지 추천해주세요.
        공식 리테일러, 대형 백화점, 전문점, 신뢰할 수 있는 온라인 쇼핑몰을 우선적으로 고려해주세요.
        
        응답 형식:
        1. 매장명1
        2. 매장명2
        3. 매장명3
        ...
      `;

      const result = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });

      if (result && typeof result === 'string') {
        // 문자열 응답에서 매장명 추출
        const storeMatches = result.match(/\d+\.\s*([^\n\r]+)/g);
        if (storeMatches && storeMatches.length > 0) {
          const stores = storeMatches.map(match => 
            match.replace(/^\d+\.\s*/, '').trim()
          ).filter(store => store.length > 0);
          
          if (stores.length > 0) {
            setRecommendedStores(stores.slice(0, 6));
            setShowStoreSelection(true);
          } else {
            alert("AI가 추천할 만한 매장을 찾지 못했습니다.");
          }
        } else {
          alert("AI가 추천할 만한 매장을 찾지 못했습니다.");
        }
      } else {
        alert("AI가 추천할 만한 매장을 찾지 못했습니다.");
      }
    } catch (error) {
      console.error("AI 매장 추천 실패:", error);
      alert("AI 매장 추천에 실패했습니다. 수동으로 입력해주세요.");
    }
  };

  const handleStoreSelect = (stores) => {
    const newLocations = stores.filter(store => !purchaseLocations.includes(store));
    setPurchaseLocations(prev => [...prev, ...newLocations]);
    setShowStoreSelection(false);
    alert(`${newLocations.length}개의 매장이 추가되었습니다!`);
  };

  const maskPhoneNumber = (contact) => {
    if (!contact) return '';
    
    // 전화번호 패턴 감지 (한국 번호 기준)
    // 010-XXXX-XXXX 또는 010XXXXXXXX, 02-XXX-XXXX, etc.
    const phonePattern1 = /^(\d{2,3})-(\d{3,4})-(\d{4})$/; // With hyphens
    const phonePattern2 = /^(\d{10,11})$/; // Without hyphens (e.g., 01012345678)
    const phonePattern3 = /^(\d{2})(\d{3,4})(\d{4})$/; // For Seoul (02) etc. without hyphens

    let cleanedContact = contact.replace(/[^\d]/g, ''); // Remove non-digits
    
    if (phonePattern1.test(contact)) {
        const match = contact.match(phonePattern1);
        return `${match[1]}-***-${match[3]}`;
    } else if (cleanedContact.length >= 10 && cleanedContact.length <= 11 && phonePattern2.test(cleanedContact)) {
        // Assuming 010-XXXX-XXXX format for 11 digits, 0XX-XXX-XXXX for 10 digits
        if (cleanedContact.startsWith('010') && cleanedContact.length === 11) {
            return `${cleanedContact.substring(0, 3)}-***-${cleanedContact.substring(7, 11)}`;
        } else if (cleanedContact.length === 10) { // Typically 02-XXX-XXXX or 0X-XXX-XXXX
             // Check if it starts with 02 (Seoul area code)
            if (cleanedContact.startsWith('02')) {
                return `${cleanedContact.substring(0, 2)}-***-${cleanedContact.substring(6, 10)}`;
            } else { // Other 3-digit area codes or general 10-digit
                return `${cleanedContact.substring(0, 3)}-***-${cleanedContact.substring(6, 10)}`;
            }
        }
    } else if (phonePattern3.test(cleanedContact)) { // Catch cases like 0212345678 without hyphens
        const match = cleanedContact.match(phonePattern3);
        return `${match[1]}-***-${match[3]}`;
    }
    
    // If it's not a phone number, or an open chat link, return as is
    return contact; 
  };

  const handleAIPriceAnalysis = async () => {
    if (!formData.product_name || !formData.country || !formData.quantity) {
      alert("제품명, 수량, 구매 희망 국가를 모두 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `
        당신은 최첨단 웹 크롤링 및 데이터 분석 AI입니다. 당신의 임무는 사용자가 요청한 제품의 가장 정확하고 신뢰할 수 있는 가격 정보를 웹에서 찾아내는 것입니다.

        **사용자 요청 정보:**
        - 제품명: ${formData.product_name}
        - 수량: ${formData.quantity}개
        - 구매 희망 국가: ${formData.country}
        - 추가 설명: ${formData.description || '정보 없음'}

        **정밀 가격 분석을 위한 웹 크롤링 절차:**
        1.  **심층 제품 분석**: 사용자의 요청(제품명, 설명)을 분석하여 검색할 정확한 브랜드, 모델, 색상, 사이즈 등의 키워드를 확정합니다.
        2.  **다중 소스 크롤링 전략**:
            - **1순위 (공식 브랜드 사이트)**: '${formData.country}'의 공식 브랜드 웹사이트를 최우선으로 크롤링하여 **제조사 권장 소비자가(MSRP)**를 현지 통화로 찾아냅니다.
            - **2순위 (주요 공식 리테일러)**: Mytheresa, Net-a-Porter, SSENSE, Farfetch 등 공인된 글로벌 명품 리테일러 사이트를 크롤링하여 가격을 교차 검증합니다.
            - **3순위 (대형 온라인 마켓플레이스)**: 아마존, 현지 주요 이커머스 플랫폼(예: 일본의 라쿠텐, 중국의 타오바오)을 크롤링하여 실거래가를 확인합니다.
        3.  **최저가 및 평균가 분석**: 크롤링한 여러 소스의 가격 정보를 비교하여 가장 신뢰성 높은 최저가 또는 평균가를 기준으로 삼습니다.
        4.  **실시간 환율 적용**: 확인된 현지 통화와 대한민국 원(KRW) 간의 **실시간 환율**을 적용하여, '현지 가격 * 수량 * 환율' 공식으로 총 예상 금액(KRW)을 정밀하게 계산합니다.
        5.  **데이터 기반 수수료 제안**: 분석된 최종 가격, 제품 카테고리(예: 명품, 전자제품), 예상 무게/부피를 종합적으로 고려하여 가장 합리적인 여행자 수수료를 원화(KRW)로 제안합니다. (고가품: 5~10%, 일반품: 10~15%, 최소 5,000원)

        **응답 형식 (다른 설명 없이, 반드시 아래 형식만 사용):**
        제품명: [당신이 찾은 가장 정확한 공식 제품명]
        예상가격: [최종 계산된 총 원화 가격. 숫자만 입력]
        수수료: [당신이 제안하는 원화 수수료. 숫자만 입력]
      `;

      const result = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
      });

      if (!result || typeof result !== 'string') {
        throw new Error("AI 응답을 받을 수 없습니다.");
      }

      // 더 유연한 패턴 매칭
      let productTitle = formData.product_name;
      let estimatedPrice = null;
      let serviceFee = null;

      // 제품명 추출 시도
      const titlePatterns = [
        /제품명:\s*([^\n\r]+)/i,
        /상품명:\s*([^\n\r]+)/i,
        /제품:\s*([^\n\r]+)/i
      ];
      
      for (const pattern of titlePatterns) {
        const match = result.match(pattern);
        if (match) {
          productTitle = match[1].trim();
          break;
        }
      }

      // 가격 추출 시도 (다양한 형식 지원)
      const pricePatterns = [
        /예상가격:\s*([0-9,]+)\s*원/i,
        /가격:\s*([0-9,]+)\s*원/i,
        /총\s*가격:\s*([0-9,]+)\s*원/i,
        /예상가격:\s*([0-9,]+)/i,
        /가격:\s*([0-9,]+)/i,
        /([0-9,]+)\s*원/i // 'g' 플래그 제거
      ];

      for (const pattern of pricePatterns) {
        const match = result.match(pattern);
        if (match && match[1]) { // match[1] 존재 여부 확인
          const priceStr = match[1].replace(/,/g, '');
          const price = parseInt(priceStr);
          if (!isNaN(price) && price > 0 && price < 100000000) { // 합리적인 가격 범위 및 isNaN 확인
            estimatedPrice = price;
            break;
          }
        }
      }

      // 수수료 추출 시도
      const feePatterns = [
        /수수료:\s*([0-9,]+)\s*원/i,
        /수수료:\s*([0-9,]+)/i,
        /대행료:\s*([0-9,]+)/i,
        /서비스\s*수수료:\s*([0-9,]+)/i
      ];

      for (const pattern of feePatterns) {
        const match = result.match(pattern);
        if (match && match[1]) { // match[1] 존재 여부 확인
          const feeStr = match[1].replace(/,/g, '');
          const fee = parseInt(feeStr);
          if (!isNaN(fee) && fee > 0 && fee < 10000000) { // 합리적인 수수료 범위 및 isNaN 확인
            serviceFee = fee;
            break;
          }
        }
      }

      // 가격이 없으면 기본값 설정 (quantity 고려)
      if (!estimatedPrice) {
        const basePrice = getEstimatedBasePrice(formData.product_name, formData.country);
        estimatedPrice = basePrice * formData.quantity;
      }

      // 수수료가 없으면 가격의 10% 또는 최소 5000원
      if (!serviceFee) {
        serviceFee = Math.max(5000, Math.round(estimatedPrice * 0.1));
      }

      const confirmMessage = `
🤖 AI 분석 완료!

- 제품명: ${productTitle}
- 예상 가격 (총 ${formData.quantity}개): ${estimatedPrice.toLocaleString('ko-KR')}원
- 추천 수수료: ${serviceFee.toLocaleString('ko-KR')}원

분석 결과를 적용하시겠습니까?
      `;

      if (window.confirm(confirmMessage)) {
        handleInputChange("product_name", productTitle);
        handleInputChange("target_price", estimatedPrice.toString());
        handleInputChange("service_fee", serviceFee.toString());
        setShowAIImageButton(true);
        alert("🎉 AI 분석 결과가 적용되었습니다! 이제 AI 이미지를 생성할 수 있습니다.");
      }

    } catch (error) {
      console.error("AI 분석 실패:", error);
      
      // 완전히 실패한 경우 기본값 제공
      const basePrice = getEstimatedBasePrice(formData.product_name, formData.country);
      const totalPrice = basePrice * formData.quantity;
      const suggestedFee = Math.max(5000, Math.round(totalPrice * 0.1));
      
      const fallbackMessage = `
AI 분석에 실패했지만, 기본 추정가격을 제안드릴게요:

- 예상 가격: ${totalPrice.toLocaleString('ko-KR')}원
- 추천 수수료: ${suggestedFee.toLocaleString('ko-KR')}원

이 값들을 사용하시겠습니까? (나중에 수정 가능합니다)
      `;
      
      if (window.confirm(fallbackMessage)) {
        handleInputChange("target_price", totalPrice.toString());
        handleInputChange("service_fee", suggestedFee.toString());
        setShowAIImageButton(true);
        alert("기본 추정가격이 적용되었습니다. 필요시 수정해주세요.");
      } else {
        alert("AI 분석에 실패했습니다. 수동으로 가격을 입력해주세요.");
      }
    }
    setIsAnalyzing(false);
  };

  // 기본 추정가격 계산 함수
  const getEstimatedBasePrice = (productName, country) => {
    const product = productName.toLowerCase();
    
    // 제품 카테고리별 기본 가격 (원화 기준)
    let basePrice = 0;
    if (product.includes('iphone') || product.includes('아이폰')) basePrice = 1200000;
    else if (product.includes('samsung') || product.includes('갤럭시')) basePrice = 1000000;
    else if (product.includes('macbook') || product.includes('맥북')) basePrice = 2000000;
    else if (product.includes('airpods') || product.includes('에어팟')) basePrice = 200000;
    else if (product.includes('watch') || product.includes('워치')) basePrice = 400000;
    else if (product.includes('perfume') || product.includes('향수') || product.includes('fragrance')) basePrice = 80000;
    else if (product.includes('cosmetic') || product.includes('화장품') || product.includes('makeup')) basePrice = 50000;
    else if (product.includes('bag') || product.includes('가방')) basePrice = 300000;
    else if (product.includes('shoes') || product.includes('신발')) basePrice = 150000;
    else if (product.includes('clothes') || product.includes('옷') || product.includes('의류')) basePrice = 100000;
    else basePrice = 100000; // Default for unknown products
    
    // 국가별 보정
    let countryMultiplier = 1.0;
    if (country.includes('미국')) countryMultiplier = 1.2;
    else if (country.includes('일본')) countryMultiplier = 1.1;
    else if (country.includes('유럽')) countryMultiplier = 1.3;
    else if (country.includes('중국')) countryMultiplier = 0.8;
    else if (country.includes('동남아')) countryMultiplier = 0.7;
    
    return Math.round(basePrice * countryMultiplier);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_name || !formData.target_price || !formData.deadline || !formData.country || !formData.delivery_method || !formData.contact_info) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        ...formData,
        purchase_locations: purchaseLocations,
        target_price: parseInt(formData.target_price),
        service_fee: parseInt(formData.service_fee) || 0,
        quantity: parseInt(formData.quantity)
      };

      await RequestEntity.create(requestData);

      alert("구매 요청이 성공적으로 등록되었습니다!");
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("요청 등록 실패:", error);
      alert("요청 등록에 실패했습니다. 다시 시도해주세요.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="rounded-full border-emerald-200 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">구매 요청 등록</h1>
            <p className="text-gray-600 mt-1">해외에서 구매하고 싶은 제품을 등록해보세요 ✨</p>
          </div>
        </div>

        {/* AI 분석 방법 안내 */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI 스마트 분석 사용법
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <p className="text-sm text-gray-700">제품명 입력</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <p className="text-sm text-gray-700">구매희망국가 입력</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <p className="text-sm text-gray-700">AI 스마트 가격분석</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                <p className="text-sm text-gray-700">AI 이미지 생성</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-400 to-emerald-400"></div>

          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              제품 정보 입력
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  기본 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="product_name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      제품명 *
                    </Label>
                    <Input
                      id="product_name"
                      placeholder="예: iPhone 15 Pro Max 256GB"
                      value={formData.product_name}
                      onChange={(e) => handleInputChange("product_name", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      제품 이미지 (선택)
                    </Label>
                    <div className="mt-2">
                      {formData.image_url ? (
                        <div className="relative">
                          <img
                            src={formData.image_url}
                            alt="업로드된 이미지"
                            className="w-full h-48 object-cover rounded-2xl border border-emerald-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleInputChange("image_url", "")}
                            className="absolute top-2 right-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 rounded-xl"
                          >
                            삭제
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-8 text-center hover:border-emerald-300 transition-colors">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">제품 이미지를 업로드하거나 AI로 생성해보세요</p>
                          <p className="text-xs text-gray-500 mb-4">💡 AI 이미지는 실제와 다를 수 있어요. 준비된 이미지가 있다면 직접 업로드하는 것을 권장합니다.</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('image-upload').click()}
                              disabled={uploadingImage}
                              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                            >
                              {uploadingImage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> 업로드 중...</> : "내 파일 선택"}
                            </Button>
                            {showAIImageButton && (
                              <Button
                                type="button"
                                onClick={handleAIImageGeneration}
                                disabled={isGenerating}
                                className={
                                  `rounded-xl text-white ` +
                                  (isGenerating
                                    ? `bg-purple-300 cursor-not-allowed`
                                    : `bg-purple-500 hover:bg-purple-600 animate-pulse`
                                  )
                                }
                              >
                                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> 생성 중...</> : <><Sparkles className="w-4 h-4 mr-2"/>AI 이미지 생성</>}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                      수량 *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      구매 희망 국가 *
                    </Label>
                    <Popover open={openCountryCombobox} onOpenChange={setOpenCountryCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCountryCombobox}
                          className="w-full justify-between mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12 text-left font-normal"
                        >
                          {formData.country
                            ? countryList.find((country) => country.value === formData.country)?.label
                            : "국가를 선택해주세요..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="국가 검색..." />
                          <CommandList>
                            <CommandEmpty>해당 국가를 찾을 수 없습니다.</CommandEmpty>
                            <CommandGroup>
                              {countryList.map((country) => (
                                <CommandItem
                                  key={country.value}
                                  value={country.label}
                                  onSelect={(currentValue) => {
                                    const selectedCountry = countryList.find(c => c.label.toLowerCase() === currentValue.toLowerCase());
                                    handleInputChange("country", selectedCountry ? selectedCountry.value : "");
                                    setOpenCountryCombobox(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${formData.country === country.value ? "opacity-100" : "opacity-0"}`}
                                  />
                                  {country.label}
                              </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {formData.country && citiesByCountry[formData.country] && citiesByCountry[formData.country].length > 0 && (
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        도시 (선택)
                      </Label>
                      <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCityCombobox}
                            className="w-full justify-between mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12 text-left font-normal"
                          >
                            {formData.city || "도시를 선택해주세요..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="도시 검색..." />
                            <CommandList>
                              <CommandEmpty>해당 도시를 찾을 수 없습니다.</CommandEmpty>
                              <CommandGroup>
                                {cityOptions.map((city) => (
                                  <CommandItem
                                    key={city}
                                    value={city}
                                    onSelect={(currentValue) => {
                                      handleInputChange("city", currentValue === formData.city ? "" : currentValue);
                                      setOpenCityCombobox(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${formData.city === city ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {city}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {formData.country && (!citiesByCountry[formData.country] || citiesByCountry[formData.country].length === 0) && (
                     <div>
                       <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                         도시 (선택)
                       </Label>
                       <Input
                         id="city"
                         placeholder="예: 도쿄"
                         value={formData.city}
                         onChange={(e) => handleInputChange("city", e.target.value)}
                         className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                       />
                     </div>
                  )}

                  <div className="md:col-span-2">
                    <Label htmlFor="purchase_locations" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      구매 희망 장소 (선택)
                    </Label>
                    
                    {/* AI 매장 추천 버튼 */}
                    {formData.product_name && formData.country && (
                      <div className="mt-2 mb-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAIStoreRecommendation}
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI 매장 추천받기
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="purchase_locations"
                        placeholder="예: Apple Store, Shinjuku"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLocation(); } }}
                        className="flex-1 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                      />
                      <Button type="button" onClick={handleAddLocation} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                        <Plus className="w-4 h-4" /> 추가
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {purchaseLocations.map((loc, index) => (
                        <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800 rounded-lg p-2">
                          {loc}
                          <button type="button" onClick={() => handleRemoveLocation(loc)} className="ml-2">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      상세 설명 (브랜드, 색상, 옵션 등)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="예: 스페이스 블랙 색상, 애플 정품, 한국 정발 제품 희망"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-24"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    가격 정보
                  </h3>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPriceHelp(true)}
                      className="rounded-xl"
                    >
                      <HelpCircle className="w-4 h-4 mr-1" />
                      분석 방법
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAIPriceAnalysis}
                      disabled={isAnalyzing || !formData.product_name || !formData.country || !formData.quantity}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg rounded-2xl px-6 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          AI 분석 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI 스마트 가격 분석
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="target_price" className="text-sm font-medium text-gray-700">
                      희망 가격 (원) *
                    </Label>
                    <Input
                      id="target_price"
                      type="number"
                      placeholder="100000"
                      value={formData.target_price}
                      onChange={(e) => handleInputChange("target_price", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                      required
                    />
                    {formData.target_price && (
                      <p className="text-sm text-gray-500 mt-1">
                        {parseInt(formData.target_price).toLocaleString('ko-KR')}원
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="service_fee" className="text-sm font-medium text-gray-700">
                      여행자 수수료 (원)
                    </Label>
                    <Input
                      id="service_fee"
                      type="number"
                      placeholder="10000"
                      value={formData.service_fee}
                      onChange={(e) => handleInputChange("service_fee", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                    />
                    {formData.service_fee && (
                      <p className="text-sm text-gray-500 mt-1">
                        {parseInt(formData.service_fee).toLocaleString('ko-KR')}원
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="negotiable"
                        checked={formData.negotiable}
                        onCheckedChange={(checked) => handleInputChange("negotiable", checked)}
                      />
                      <Label htmlFor="negotiable" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-yellow-500" />
                        가격 협상 가능
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  일정 및 배송
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">
                      구매 마감일 *
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange("deadline", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="delivery_method" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      배송 방식 *
                    </Label>
                    <Select value={formData.delivery_method} onValueChange={(value) => handleInputChange("delivery_method", value)}>
                      <SelectTrigger className="mt-2 border-emerald-200/50 rounded-2xl h-12">
                        <SelectValue placeholder="배송 방식을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="협의">💬 협의</SelectItem>
                        <SelectItem value="인천직거래">✈️ 인천직거래</SelectItem>
                        <SelectItem value="택배">📦 택배</SelectItem>
                        <SelectItem value="SFR접수">🏢 SFR접수 (준비중)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.delivery_method === "SFR접수" && (
                      <p className="text-xs text-amber-600 mt-1">
                        * SFR(숍프렌드) 접수: 전국 주요 공항 부스를 통한 택배 서비스 (현재 준비 중입니다)
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="contact_info" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      연락처 * 
                      <span className="text-xs text-gray-500">(전화번호는 일부 숨김 처리됩니다)</span>
                    </Label>
                    <Input
                      id="contact_info"
                      placeholder="전화번호 또는 오픈채팅 링크"
                      value={formData.contact_info}
                      onChange={(e) => handleInputChange("contact_info", e.target.value)}
                      className="mt-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-300 rounded-2xl h-12"
                      required
                    />
                    {formData.contact_info && (
                      <p className="text-sm text-gray-500 mt-1">
                        공개 표시: {maskPhoneNumber(formData.contact_info)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-emerald-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Home"))}
                  className="px-8 border-gray-200 rounded-2xl"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white px-12 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {isSubmitting ? (
                    "등록 중..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      요청 등록하기
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 매장 선택 다이얼로그 */}
        <Dialog open={showStoreSelection} onOpenChange={setShowStoreSelection}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-500" />
                추천 매장 선택
              </DialogTitle>
              <DialogDescription>
                AI가 추천한 매장 중 원하는 곳을 선택해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recommendedStores.map((store, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{store}</span>
                  <Button
                    size="sm"
                    onClick={() => handleStoreSelect([store])}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    선택
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowStoreSelection(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button 
                onClick={() => handleStoreSelect(recommendedStores)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              >
                모두 선택
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI 가격 분석 도움말 다이얼로그 */}
        <Dialog open={showPriceHelp} onOpenChange={setShowPriceHelp}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-500" />
                AI 스마트 가격 분석이란?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">
                AI가 인터넷에서 실시간으로 제품 정보를 검색하여 정확한 가격과 수수료를 분석해드립니다.
              </p>
              <div className="bg-purple-50 p-4 rounded-2xl">
                <h4 className="font-semibold text-purple-800 mb-2">분석 과정:</h4>
                <ul className="space-y-1 text-sm text-purple-700">
                  <li>1. 제품명으로 정확한 상품명 찾기</li>
                  <li>2. 해당 국가의 현지 시장 가격 조사</li>
                  <li>3. 수량에 따른 총 가격 계산</li>
                  <li>4. 적정 여행자 수수료 제안</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                💡 <strong>팁:</strong> 제품명, 수량, 국가를 정확히 입력할수록 더 정확한 분석을 받을 수 있습니다.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
