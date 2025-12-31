import { Metadata } from "next";
import { ChapterReaderUI } from "@/components/chapters/chapter-reader-ui";

// Mock data for UI demonstration
const mockNovel = {
  title: "Đấu Phá Thương Khung",
  slug: "dau-pha-thuong-khung",
};

// Mock chapters with different content for testing navigation
const mockChapters: Record<number, { title: string; content: string[] }> = {
  1: {
    title: "Thiếu Niên Thiên Tài",
    content: [
      "Giữa trời nắng gắt, một thiếu niên đứng trên đỉnh núi cao, ánh mắt ngước nhìn xa xăm về phía chân trời. Gió núi thổi qua, tung mái tóc đen dài của cậu bay phấp phới.",
      "Tiêu Viêm, một cái tên từng làm rung chuyển cả đại lục Đấu Khí. Cách đây ba năm, cậu còn là một thiên tài tu luyện hiếm có, Đấu Khí tăng tiến với tốc độ kinh người.",
      "Ba năm trôi qua, từ một thiên tài được mọi người ngưỡng mộ, cậu trở thành một phế vật bị cả gia tộc khinh thường. Những lời chế nhạo, những ánh mắt khinh bỉ, đã từng khiến cậu đau khổ biết bao.",
      "Trong tâm trí Tiêu Viêm, một giọng nói nhẹ nhàng vang lên. Đó là giọng nói của người thầy bí ẩn, người đã truyền cho cậu những kiến thức tu luyện vô giá.",
      "Cậu nắm chặt đôi tay, cảm nhận luồng Đấu Khí yếu ớt trong cơ thể. Dù yếu, dù nhỏ bé, nhưng đó là hy vọng. Miễn còn hy vọng, cậu sẽ không từ bỏ.",
    ],
  },
  2: {
    title: "Gặp Gỡ Sư Phụ",
    content: [
      "Trong căn phòng tối tăm, Tiêu Viêm ngồi xếp bằng trên giường, đôi mắt nhắm chặt. Trên ngón tay của cậu, một chiếc nhẫn cổ xưa tỏa ra ánh sáng yếu ớt.",
      "Đột nhiên, từ trong nhẫn, một bóng người già nua hiện ra. Đó là Dược Lão, một luyện dược sư cấp cao từng danh chấn thiên hạ, giờ chỉ còn là một linh hồn nương náu trong chiếc nhẫn.",
      "'Tiểu tử, ngươi đã sẵn sàng chưa?' Giọng nói của Dược Lão vang lên, uy nghiêm nhưng cũng đầy quan tâm.",
      "Tiêu Viêm mở mắt, ánh mắt kiên định. 'Con đã sẵn sàng, sư phụ. Xin sư phụ chỉ giáo.'",
      "'Tốt. Ta sẽ dạy ngươi Phần Quyết Tu Luyện. Nhưng con đường này sẽ vô cùng gian khổ. Ngươi có quyết tâm không?' Dược Lão hỏi.",
      "Tiêu Viêm gật đầu mạnh mẽ. 'Con có. Con sẽ không bao giờ từ bỏ.'",
    ],
  },
  3: {
    title: "Bắt Đầu Tu Luyện",
    content: [
      "Buổi sáng sớm, khi mặt trời vừa ló dạng, Tiêu Viêm đã có mặt tại rừng sau núi. Đây là nơi vắng vẻ, lý tưởng để tu luyện mà không bị ai quấy rầy.",
      "Theo lời chỉ dẫn của Dược Lão, cậu bắt đầu tập luyện các động tác cơ bản. Mỗi động tác đều cần thực hiện với độ chính xác tuyệt đối.",
      "'Đừng vội vàng! Tu luyện không phải là chạy đua. Từng bước một, vững chắc mới quan trọng,' Dược Lão nhắc nhở.",
      "Mồ hôi đầm đìa, cơ thể đau nhức, nhưng Tiêu Viêm không dừng lại. Cậu biết rằng, đây chỉ là khởi đầu của một hành trình dài.",
      "Khi hoàng hôn buông xuống, Tiêu Viêm đã hoàn thành xong bài tập đầu tiên. Tuy mệt mỏi, nhưng trong lòng cậu tràn đầy niềm vui. Đây là bước đi đầu tiên trên con đường trở lại.",
    ],
  },
  4: {
    title: "Thử Thách Đầu Tiên",
    content: [
      "Ba tháng trôi qua như chớp mắt. Tiêu Viêm đã tiến bộ đáng kể, Đấu Khí trong cơ thể cậu đã vững chắc hơn nhiều.",
      "Hôm nay, trong gia tộc có một cuộc thi thường niên. Đây là cơ hội để các thiếu niên thể hiện sức mạnh và tranh giành tài nguyên tu luyện.",
      "Tiêu Viêm quyết định tham gia. Cậu muốn chứng minh cho mọi người thấy, mình không còn là phế vật như xưa nữa.",
      "Trên võ đài, đối thủ của cậu là Tiêu Ninh, một thiên tài trẻ của gia tộc, từng chế nhạo cậu nhiều lần.",
      "'Tiêu Viêm, ngươi dám lên đài với ta sao? Hay là muốn bị ta đánh thêm một trận nữa?' Tiêu Ninh cười khẩy.",
      "Tiêu Viêm không đáp lại, chỉ nhìm đối phương với ánh mắt bình tĩnh. Trận chiến sắp bắt đầu.",
    ],
  },
  5: {
    title: "Chiến Thắng Đầu Tiên",
    content: [
      "Tiếng gong vang lên, trận đấu bắt đầu. Tiêu Ninh lao tới như một con báo, nắm đấm chứa đầy Đấu Khí hướng về phía Tiêu Viêm.",
      "Tiêu Viêm né tránh nhẹ nhàng, cơ thể di chuyển như một cơn gió. Đây là kết quả của ba tháng khổ luyện.",
      "'Sao có thể!' Tiêu Ninh kinh ngạc. Tốc độ của Tiêu Viêm đã thay đổi hoàn toàn so với trước.",
      "Không chờ đối phương phản ứng, Tiêu Viêm phản công. Một đòn đấm mạnh mẽ, chứa đầy Đấu Khí, đánh trúng ngực Tiêu Ninh.",
      "Tiêu Ninh bay ra khỏi võ đài, rơi xuống đất. Trận đấu kết thúc. Tiêu Viêm thắng!",
      "Toàn bộ gia tộc im lặng. Họ không thể tin được, phế vật ngày xưa giờ đã mạnh đến thế. Tiêu Viêm đứng trên võ đài, ánh mắt kiên định nhìn xa. Đây chỉ là bước đầu tiên.",
    ],
  },
};

function getMockChapter(chapterNumber: number) {
  // Return specific chapter if exists, otherwise generate generic chapter
  if (mockChapters[chapterNumber]) {
    return {
      number: chapterNumber,
      title: mockChapters[chapterNumber].title,
      content: mockChapters[chapterNumber].content,
    };
  }

  // Generic chapter for numbers beyond our mock data
  return {
    number: chapterNumber,
    title: `Chương ${chapterNumber}`,
    content: [
      `Đây là nội dung của chương ${chapterNumber}. Hành trình của Tiêu Viêm tiếp tục...`,
      "Với mỗi bước đi, cậu ngày càng mạnh mẽ hơn. Những thử thách mới đang chờ đợi phía trước.",
      "Nhưng với ý chí kiên cường và sự hướng dẫn của Dược Lão, không gì có thể ngăn cản được cậu.",
      "Con đường tu luyện còn dài, nhưng Tiêu Viêm đã sẵn sàng đối mặt với mọi khó khăn.",
    ],
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterNumber: string }>;
}): Promise<Metadata> {
  const { chapterNumber } = await params;
  const chapterNum = parseInt(chapterNumber);
  const chapter = getMockChapter(chapterNum);

  const title = `Chương ${chapter.number}: ${chapter.title} - ${mockNovel.title}`;
  const description = `Đọc ${title}. Truyện ${mockNovel.title} - Chương ${chapter.number}`;

  return {
    title,
    description,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterNumber: string }>;
}) {
  const { chapterNumber } = await params;
  const chapterNum = parseInt(chapterNumber);

  const chapter = getMockChapter(chapterNum);
  const totalChapters = 200; // Mock total chapters

  return (
    <ChapterReaderUI
      novel={mockNovel}
      chapter={chapter}
      totalChapters={totalChapters}
    />
  );
}
