import Image from "next/image";
import AICard from "./AICard"; 

// Dữ liệu Card không đổi
const AI_FEATURES = [
  { title: "Ước lượng Band Score", description: "Dự đoán điểm dựa trên tiêu chí IELTS thực tế, kèm lời khuyên cá nhân hóa" },
  { title: "Gợi Ý Diễn Đạt", description: "Paraphrase câu để thêm tính học thuật, đa dạng từ vựng" },
  { title: "Đánh Giá Cấu Trúc", description: "Xác định format Task 1/2 chuẩn IELTS, gợi ý cải thiện mạch lạc" },
  { title: "Kiểm Tra Ngữ Pháp", description: "Phát hiện và sửa lỗi ngay lập tức, giúp câu văn mượt mà hơn" },
];

// Định nghĩa chiều cao cho Section và các lớp nền
const SECTION_MIN_HEIGHT = 'min-h-[1024px]'; 
const MOSAIC_BOTTOM_HEIGHT = 'h-[500px]'; 
const MOSAIC_TOP_HEIGHT = 'h-[250px]'; 
const BG_SCROLL_CLASS = "animate-scroll-right-custom";   // Class cho hiệu ứng cuộn

const AISection = () => {
  return (
    <section className={`relative overflow-hidden py-24 md:py-32 bg-white ${SECTION_MIN_HEIGHT} px-4 md:px-8 lg:px-12 xl:px-16`}>
      
      {/* ==================================== */}
      {/* ===== LỚP NỀN (BACKGROUND) ===== */}
      {/* ==================================== */}
      
      {/* LỚP Z-1: MOSAIC BOTTOM (CUỘN) */}
      {/* Container cuộn chung (Rộng 200%, áp dụng animation) */}
      <div className={`absolute bottom-0 left-0 right-0 ${MOSAIC_BOTTOM_HEIGHT} z-1 overflow-hidden`}>
        <div className={`absolute inset-0 flex w-[200%] flex-nowrap ${BG_SCROLL_CLASS}`}>
          {/* Bản Gốc */}
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src="/images/introduction/mosaic-bottom.svg" alt="Nền họa tiết Mosaic dưới" fill className="object-cover" sizes="50vw"/>
          </div>
          {/* Bản Lặp */}
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src="/images/introduction/mosaic-bottom.svg" alt="Nền họa tiết Mosaic dưới (lặp)" fill className="object-cover" sizes="50vw"/>
          </div>
        </div>
      </div>
      
      {/* LỚP Z-2: NHÂN VẬT ĐẠI DIỆN (TĨNH) - ĐÃ SỬA CĂN LỀ */}
      {/* Dùng translate-x-[khoảng cách] để căn lề trái giống với nội dung chính */}
      <div className="absolute bottom-0 left-0 translate-x-4 md:translate-x-8 w-[560px] h-[650px] lg:w-[650px] lg:h-[800px] z-2 hidden lg:block">
          <Image
              src="/images/introduction/ai-person.svg"
              alt="Nhân vật đại diện cho tính năng AI"
              fill
              className="object-contain object-bottom"
              sizes="(max-width: 1024px) 0vw, 450px"
          />
      </div>
      
      {/* LỚP Z-3: MOSAIC TOP (CUỘN) */}
      {/* Container cuộn chung (Rộng 200%, áp dụng animation) */}
      <div className={`absolute bottom-0 left-0 right-0 ${MOSAIC_TOP_HEIGHT} z-3 overflow-hidden`}>
        <div className={`absolute inset-0 flex w-[200%] flex-nowrap ${BG_SCROLL_CLASS}`}>
          {/* Bản Gốc */}
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src="/images/introduction/mosaic-top.svg" alt="Nền họa tiết Mosaic trên" fill className="object-cover" sizes="50vw"/>
          </div>
          {/* Bản Lặp */}
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src="/images/introduction/mosaic-top.svg" alt="Nền họa tiết Mosaic trên (lặp)" fill className="object-cover" sizes="50vw"/>
          </div>
        </div>
      </div>

      {/* ==================================== */}
      {/* ===== LỚP NỘI DUNG CHÍNH (z-4) - Cần đẩy z-index lên 4 để nằm trên Mosaic Top ===== */}
      {/* ==================================== */}
      <div className="relative z-4 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start text-left lg:text-left">
          
          {/* CỘT TRÁI: TIÊU ĐỀ, MÔ TẢ - CĂN GIỮA TRÊN MOBILE/TABLET */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            
            {/* TIÊU ĐỀ CHÍNH (Font Xanh Mono) */}
            <h2 className="text-3xl md:text-5xl font-xanhmono text-gray-900 leading-tight">
              AI Thông Minh –
              <br />
              Người Bạn Đồng Hành
              <br />
              Trong Luyện Viết
            </h2>

            {/* MÔ TẢ NGẮN (Font Inter) */}
            <p className="text-md md:text-xl max-w-lg mx-auto lg:mx-0 text-gray-700 font-inter">
              Công nghệ AI tiên tiến giúp phân tích bài viết của bạn chỉ trong giây lát, mang lại phản hồi chính xác và hữu ích để nâng band score nhanh chóng.
            </p>
          </div>
          
          {/* CỘT PHẢI: CÁC TÍNH NĂNG (CARDS) - ĐÃ SỬA VỊ TRÍ VÀ GIÃN CÁCH */}
          {/* Tăng space-y (khoảng cách giữa các card) và margin-top */}
          <div className="space-y-8 md:space-y-10"> 
              {AI_FEATURES.map((feature, index) => (
                  <AICard
                      key={index}
                      title={feature.title}
                      description={feature.description}
                      // Tinh chỉnh lớp so le: 
                      // Card chẵn (0, 2): Dùng ml-auto để căn phải, sau đó dịch vào
                      // Card lẻ (1, 3): Căn trái (mặc định), sau đó dịch vào
                      className={`lg:max-w-none transition-all duration-300 ease-in-out ${
                          index % 2 === 0 
                          ? "lg:ml-auto lg:w-[90%] xl:w-[85%]" // Đẩy sang phải và giảm width
                          : "lg:mr-auto lg:w-[90%] xl:w-[85%]" // Căn trái và giảm width
                      }`}
                  />
              ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AISection;