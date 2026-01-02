import Link from "next/link";
import { SEOContent } from "@/components/seo/seo-content";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  // SEO content for the footer
  const seoContent = `
    <h2>Đọc Truyện Online Miễn Phí Tại Truyện Đọc</h2>
    <p>
      <strong>Truyện Đọc</strong> là nền tảng đọc truyện online hàng đầu Việt Nam, 
      cung cấp hàng ngàn tác phẩm văn học đa dạng với giao diện thân thiện, 
      cập nhật nhanh chóng và hoàn toàn miễn phí.
    </p>
    
    <h3>Tại Sao Chọn Truyện Đọc?</h3>
    <ul>
      <li><strong>Kho Truyện Khổng Lồ:</strong> Hàng ngàn tác phẩm thuộc nhiều thể loại: 
      tiên hiệp, huyền huyễn, kiếm hiệp, ngôn tình, đô thị, khoa huyễn...</li>
      <li><strong>Cập Nhật Liên Tục:</strong> Các chương mới được cập nhật mỗi ngày, 
      bạn sẽ không bao giờ thiếu nội dung để đọc.</li>
      <li><strong>Trải Nghiệm Tuyệt Vời:</strong> Giao diện hiện đại, tối ưu cho cả 
      mobile và desktop, hỗ trợ chế độ đọc ban đêm.</li>
      <li><strong>Hoàn Toàn Miễn Phí:</strong> Đọc không giới hạn, không quảng cáo 
      làm phiền, trải nghiệm trọn vẹn câu chuyện.</li>
    </ul>
    
    <h3>Khám Phá Thể Loại Truyện Phổ Biến</h3>
    <p>
      Tại Truyện Đọc, bạn có thể tìm thấy mọi thể loại truyện yêu thích. 
      <a href="/the-loai/tien-hiep">Truyện tiên hiệp</a> với những cuộc phiêu lưu tu tiên đầy kỳ ảo, 
      <a href="/the-loai/ngon-tinh">truyện ngôn tình</a> với những câu chuyện tình yêu lãng mạn, 
      hay <a href="/the-loai/huyen-huyen">truyện huyền huyễn</a> với thế giới kỳ ảo đầy mê hoặc.
    </p>
    
    <p>
      Hãy khám phá <a href="/hoan-thanh">truyện hoàn thành</a> để đọc những tác phẩm đã kết thúc 
      hoặc theo dõi <a href="/dang-ra">truyện đang ra</a> để cập nhật những chương mới nhất 
      mỗi ngày. Trải nghiệm đọc truyện tuyệt vời đang chờ bạn!
    </p>
  `;

  return (
    <footer className="site-footer bg-gray-900 text-gray-300">
      {/* SEO Content Section */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <SEOContent content={seoContent} />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-white font-medium mb-4">Danh mục</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/truyen-hot"
                  className="hover:text-white transition-colors"
                >
                  Truyện hot
                </Link>
              </li>
              <li>
                <Link
                  href="/dang-ra"
                  className="hover:text-white transition-colors"
                >
                  Đang ra
                </Link>
              </li>
              <li>
                <Link
                  href="/hoan-thanh"
                  className="hover:text-white transition-colors"
                >
                  Hoàn thành
                </Link>
              </li>
              <li>
                <Link
                  href="/the-loai"
                  className="hover:text-white transition-colors"
                >
                  Thể loại
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-medium mb-4">Thể loại</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/the-loai/tien-hiep"
                  className="hover:text-white transition-colors"
                >
                  Tiên hiệp
                </Link>
              </li>
              <li>
                <Link
                  href="/the-loai/huyen-huyen"
                  className="hover:text-white transition-colors"
                >
                  Huyền huyễn
                </Link>
              </li>
              <li>
                <Link
                  href="/the-loai/ngon-tinh"
                  className="hover:text-white transition-colors"
                >
                  Ngôn tình
                </Link>
              </li>
              <li>
                <Link
                  href="/the-loai/kiem-hiep"
                  className="hover:text-white transition-colors"
                >
                  Kiếm hiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-medium mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/lien-he"
                  className="hover:text-white transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/huong-dan"
                  className="hover:text-white transition-colors"
                >
                  Hướng dẫn
                </Link>
              </li>
              <li>
                <Link
                  href="/gop-y"
                  className="hover:text-white transition-colors"
                >
                  Góp ý
                </Link>
              </li>
              <li>
                <Link
                  href="/bao-loi"
                  className="hover:text-white transition-colors"
                >
                  Báo lỗi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-white font-medium mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dieu-khoan"
                  className="hover:text-white transition-colors"
                >
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-bao-mat"
                  className="hover:text-white transition-colors"
                >
                  Bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/ban-quyen"
                  className="hover:text-white transition-colors"
                >
                  Bản quyền
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="hover:text-white transition-colors"
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h3 className="text-white font-medium mb-4">Cộng đồng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dien-dan"
                  className="hover:text-white transition-colors"
                >
                  Diễn đàn
                </Link>
              </li>
              <li>
                <Link
                  href="/nhom"
                  className="hover:text-white transition-colors"
                >
                  Nhóm dịch
                </Link>
              </li>
              <li>
                <Link
                  href="/tac-gia"
                  className="hover:text-white transition-colors"
                >
                  Tác giả
                </Link>
              </li>
              <li>
                <Link
                  href="/binh-luan"
                  className="hover:text-white transition-colors"
                >
                  Bình luận
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6 */}
          <div>
            <h3 className="text-white font-medium mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/gioi-thieu"
                  className="hover:text-white transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/tuyen-dung"
                  className="hover:text-white transition-colors"
                >
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/quang-cao"
                  className="hover:text-white transition-colors"
                >
                  Quảng cáo
                </Link>
              </li>
              <li>
                <Link
                  href="/doi-tac"
                  className="hover:text-white transition-colors"
                >
                  Đối tác
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div className="text-center md:text-left">
              <p className="mb-1">
                © {currentYear} Truyện Đọc. Tất cả quyền được bảo lưu.
              </p>
              <p className="mb-1">
                Liên hệ: contact@truyendoc.com | Hotline: 1900-xxxx
              </p>
              <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Discord"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
