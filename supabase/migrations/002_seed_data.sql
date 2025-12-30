-- Seed Data for Vietnamese Novel Platform
-- Run after 001_core_schema.sql

-- ============================================
-- 1. AUTHORS
-- ============================================
INSERT INTO authors (id, name, slug, bio, normalized_name) VALUES
('a1111111-1111-1111-1111-111111111111', 'Nguyễn Văn An', 'nguyen-van-an', 'Tác giả nổi tiếng với thể loại tu tiên và huyền huyễn. Đã có 5 năm kinh nghiệm sáng tác.', 'nguyen van an'),
('a2222222-2222-2222-2222-222222222222', 'Trần Thị Bình', 'tran-thi-binh', 'Chuyên viết truyện ngôn tình, lãng mạn. Tác phẩm được độc giả yêu thích.', 'tran thi binh'),
('a3333333-3333-3333-3333-333333333333', 'Lê Minh Châu', 'le-minh-chau', 'Tác giả trẻ với phong cách viết hiện đại, táo bạo. Chuyên đề tài đô thị và kiếm hiệp.', 'le minh chau'),
('a4444444-4444-4444-4444-444444444444', 'Phạm Hoàng Đức', 'pham-hoang-duc', 'Bút hiệu nổi tiếng với dòng truyện hành động, võ hiệp. 10 năm kinh nghiệm.', 'pham hoang duc'),
('a5555555-5555-5555-5555-555555555555', 'Hoàng Thu Hà', 'hoang-thu-ha', 'Chuyên sáng tác thể loại fantasy và phiêu lưu. Tác phẩm đa dạng và sáng tạo.', 'hoang thu ha')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. GENRES (Hierarchical)
-- ============================================
-- Top-level genres
INSERT INTO genres (id, name, slug, name_vi, description, parent_id) VALUES
('e1000000-0000-0000-0000-000000000001', 'Fantasy', 'fantasy', 'Huyền Huyễn', 'Thể loại giả tưởng với ma thuật và sinh vật thần thoại', NULL),
('e1000000-0000-0000-0000-000000000002', 'Martial Arts', 'martial-arts', 'Võ Hiệp', 'Võ thuật, giang hồ, kiếm hiệp', NULL),
('e1000000-0000-0000-0000-000000000003', 'Romance', 'romance', 'Ngôn Tình', 'Tình cảm lãng mạn', NULL),
('e1000000-0000-0000-0000-000000000004', 'Urban', 'urban', 'Đô Thị', 'Cuộc sống đô thị hiện đại', NULL),
('e1000000-0000-0000-0000-000000000005', 'Action', 'action', 'Hành Động', 'Phiêu lưu và hành động', NULL),
('e1000000-0000-0000-0000-000000000006', 'Historical', 'historical', 'Lịch Sử', 'Bối cảnh lịch sử', NULL)
ON CONFLICT (id) DO NOTHING;

-- Sub-genres
INSERT INTO genres (id, name, slug, name_vi, description, parent_id) VALUES
('e2000000-0000-0000-0000-000000000001', 'Xuanhuan', 'xuanhuan', 'Huyền Huyễn', 'Tu luyện thần thông, tiên hiệp', 'e1000000-0000-0000-0000-000000000001'),
('e2000000-0000-0000-0000-000000000002', 'Xianxia', 'xianxia', 'Tiên Hiệp', 'Tu tiên đắc đạo', 'e1000000-0000-0000-0000-000000000001'),
('e2000000-0000-0000-0000-000000000003', 'Wuxia', 'wuxia', 'Kiếm Hiệp', 'Giang hồ võ lâm', 'e1000000-0000-0000-0000-000000000002'),
('e2000000-0000-0000-0000-000000000004', 'Modern Romance', 'modern-romance', 'Ngôn Tình Hiện Đại', 'Tình yêu thời hiện đại', 'e1000000-0000-0000-0000-000000000003'),
('e2000000-0000-0000-0000-000000000005', 'CEO Romance', 'ceo-romance', 'Tổng Tài', 'Tình yêu với tổng giám đốc', 'e1000000-0000-0000-0000-000000000003'),
('e2000000-0000-0000-0000-000000000006', 'Rebirth', 'rebirth', 'Trọng Sinh', 'Tái sinh về quá khứ', 'e1000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. NOVELS
-- ============================================
INSERT INTO novels (
    id, title, slug, alternative_titles, description, author_id, status,
    normalized_title, source_type, total_chapters, total_words,
    view_count_total, view_count_weekly, view_count_daily,
    rating_average, rating_count, bookmark_count,
    meta_title, meta_description, is_published, published_at, last_chapter_at
) VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    'Võ Thần Thiên Hạ',
    'vo-than-thien-ha',
    ARRAY['Martial God World', 'Võ Đế Thiên Hạ'],
    'Thiếu niên bị coi thường vì không có huyết mạch tu luyện, nhưng sau khi nhặt được bảo vật cổ đại, anh đã bắt đầu con đường nghịch thiên tu luyện, trở thành Võ Thần tối cao!',
    'a1111111-1111-1111-1111-111111111111',
    'ongoing',
    'vo than thien ha',
    'manual',
    245,
    3250000,
    125000,
    8500,
    650,
    4.8,
    1250,
    890,
    'Võ Thần Thiên Hạ - Truyện Tu Tiên Hấp Dẫn',
    'Đọc truyện Võ Thần Thiên Hạ - Hành trình tu luyện nghịch thiên của thiếu niên. Cập nhật liên tục.',
    true,
    NOW() - INTERVAL '6 months',
    NOW() - INTERVAL '2 days'
),
(
    'd2222222-2222-2222-2222-222222222222',
    'Tình Yêu Không Có Lỗi',
    'tinh-yeu-khong-co-loi',
    ARRAY['Love Without Fault'],
    'Cô ấy là cô gái bình thường, anh ấy là tổng giám đốc quyền lực. Cuộc gặp gỡ định mệnh đã thay đổi cuộc đời cả hai.',
    'a2222222-2222-2222-2222-222222222222',
    'completed',
    'tinh yeu khong co loi',
    'manual',
    180,
    1800000,
    95000,
    6200,
    420,
    4.6,
    2100,
    1450,
    'Tình Yêu Không Có Lỗi - Ngôn Tình Hay',
    'Truyện ngôn tình hiện đại, tình yêu giữa cô gái bình thường và tổng giám đốc.',
    true,
    NOW() - INTERVAL '1 year',
    NOW() - INTERVAL '2 months'
),
(
    'd3333333-3333-3333-3333-333333333333',
    'Trọng Sinh Chi Đô Thị Tu Tiên',
    'trong-sinh-chi-do-thi-tu-tien',
    ARRAY['Urban Rebirth Immortal', 'Đô Thị Tu Tiên'],
    'Chân Vũ Đế Tôn trọng sinh về quá khứ, quyết tâm sửa chữa những sai lầm, bảo vệ người thân và xưng bá đô thị!',
    'a3333333-3333-3333-3333-333333333333',
    'ongoing',
    'trong sinh chi do thi tu tien',
    'manual',
    520,
    6800000,
    285000,
    18500,
    1850,
    4.9,
    3850,
    2340,
    'Trọng Sinh Chi Đô Thị Tu Tiên - Top Truyện Hay',
    'Đọc truyện Trọng Sinh Chi Đô Thị Tu Tiên - Tu tiên tại đô thị, nghịch thiên thay mệnh.',
    true,
    NOW() - INTERVAL '18 months',
    NOW() - INTERVAL '1 day'
),
(
    'd4444444-4444-4444-4444-444444444444',
    'Kiếm Đạo Độc Tôn',
    'kiem-dao-doc-ton',
    ARRAY['Peerless Sword God', 'Kiếm Thần'],
    'Ta chỉ có một kiếm, có thể phá vạn pháp! Hành trình từ đệ tử bình thường lên đỉnh cao kiếm đạo.',
    'a4444444-4444-4444-4444-444444444444',
    'ongoing',
    'kiem dao doc ton',
    'manual',
    389,
    5100000,
    156000,
    11200,
    980,
    4.7,
    2680,
    1890,
    'Kiếm Đạo Độc Tôn - Truyện Kiếm Hiệp Hay',
    'Tu luyện kiếm đạo, xưng tôn thiên hạ. Truyện kiếm hiệp hấp dẫn, cập nhật hàng ngày.',
    true,
    NOW() - INTERVAL '10 months',
    NOW() - INTERVAL '1 day'
),
(
    'd5555555-5555-5555-5555-555555555555',
    'Nữ Đế Trọng Sinh',
    'nu-de-trong-sinh',
    ARRAY['Empress Rebirth', 'Nữ Hoàng Trọng Sinh'],
    'Đời trước bị phản bội và chết oan, đời này trọng sinh về, thề sẽ lấy lại mọi thứ!',
    'a5555555-5555-5555-5555-555555555555',
    'hiatus',
    'nu de trong sinh',
    'manual',
    156,
    2100000,
    68000,
    4200,
    350,
    4.5,
    890,
    650,
    'Nữ Đế Trọng Sinh - Nữ Chủ Mạnh Mẽ',
    'Truyện nữ chủ mạnh mẽ, trọng sinh phục thù. Cốt truyện hấp dẫn, lôi cuốn.',
    true,
    NOW() - INTERVAL '8 months',
    NOW() - INTERVAL '1 month'
),
(
    'd6666666-6666-6666-6666-666666666666',
    'Toàn Chức Pháp Sư',
    'toan-chuc-phap-su',
    ARRAY['Full-time Mage', 'Pháp Thuật Toàn Diện'],
    'Thức tỉnh hệ lôi và hệ hỏa, trên con đường trở thành pháp sư toàn năng nhất!',
    'a1111111-1111-1111-1111-111111111111',
    'completed',
    'toan chuc phap su',
    'manual',
    3200,
    12500000,
    450000,
    28000,
    2100,
    4.9,
    5200,
    3800,
    'Toàn Chức Pháp Sư - Truyện Fantasy Hay Nhất',
    'Truyện fantasy đình đám với 3200 chương. Hành trình tu luyện pháp thuật đỉnh cao.',
    true,
    NOW() - INTERVAL '3 years',
    NOW() - INTERVAL '6 months'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. NOVEL_GENRES (Many-to-Many)
-- ============================================
INSERT INTO novel_genres (novel_id, genre_id) VALUES
-- Võ Thần Thiên Hạ: Xuanhuan + Action
('d1111111-1111-1111-1111-111111111111', 'e2000000-0000-0000-0000-000000000001'),
('d1111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000005'),
-- Tình Yêu Không Có Lỗi: Romance + CEO Romance
('d2222222-2222-2222-2222-222222222222', 'e1000000-0000-0000-0000-000000000003'),
('d2222222-2222-2222-2222-222222222222', 'e2000000-0000-0000-0000-000000000005'),
-- Trọng Sinh Chi Đô Thị Tu Tiên: Urban + Rebirth + Xianxia
('d3333333-3333-3333-3333-333333333333', 'e1000000-0000-0000-0000-000000000004'),
('d3333333-3333-3333-3333-333333333333', 'e2000000-0000-0000-0000-000000000006'),
('d3333333-3333-3333-3333-333333333333', 'e2000000-0000-0000-0000-000000000002'),
-- Kiếm Đạo Độc Tôn: Martial Arts + Wuxia
('d4444444-4444-4444-4444-444444444444', 'e1000000-0000-0000-0000-000000000002'),
('d4444444-4444-4444-4444-444444444444', 'e2000000-0000-0000-0000-000000000003'),
-- Nữ Đế Trọng Sinh: Fantasy + Rebirth
('d5555555-5555-5555-5555-555555555555', 'e1000000-0000-0000-0000-000000000001'),
('d5555555-5555-5555-5555-555555555555', 'e2000000-0000-0000-0000-000000000006'),
-- Toàn Chức Pháp Sư: Fantasy + Action
('d6666666-6666-6666-6666-666666666666', 'e1000000-0000-0000-0000-000000000001'),
('d6666666-6666-6666-6666-666666666666', 'e1000000-0000-0000-0000-000000000005')
ON CONFLICT (novel_id, genre_id) DO NOTHING;

-- ============================================
-- 5. CHAPTERS (Sample chapters for each novel)
-- ============================================

-- Chapters for "Võ Thần Thiên Hạ" (first 10 chapters)
INSERT INTO chapters (
    id, novel_id, title, slug, chapter_number, content, word_count,
    normalized_title, is_published, published_at, view_count
) VALUES
('c1111111-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 'Chương 1: Phế Vật', 'chuong-1-phe-vat', 1, 
'Thiên Vũ Đại Lục, nơi tôn sùng sức mạnh.\n\nCô Vân Thành, một trong ba đại thành chủ yếu của Đế Quốc Thiên Lăng.\n\n"Diệp Trần! Ngươi là phế vật của gia tộc, không có huyết mạch tu luyện. Từ nay, ngươi bị trục xuất khỏi Diệp gia!"\n\nGia chủ Diệp gia lạnh lùng tuyên bố, ánh mắt khinh thường nhìn về phía thiếu niên 16 tuổi đang quỳ dưới đất.\n\nDiệp Trần nắm chặt hai tay, móng tay đâm sâu vào lòng bàn tay, máu chảy ra nhưng anh không hề hay biết.\n\n"Cha! Con không phải phế vật! Con sẽ chứng minh!"\n\nNhưng không ai quan tâm đến lời nói của một phế vật.\n\nĐêm đó, Diệp Trần rời khỏi Diệp gia, tim đầy oán hận và quyết tâm.',
280, 'phe vat', true, NOW() - INTERVAL '6 months', 12500),

('c1111111-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 'Chương 2: Bảo Vật Cổ Đại', 'chuong-2-bao-vat-co-dai', 2,
'Diệp Trần lang thang trong rừng sâu, không biết đi về đâu.\n\nĐột nhiên, một luồng ánh sáng kỳ lạ xuất hiện từ dưới đất.\n\n"Đó là gì?"\n\nAnh đào đất và tìm thấy một viên đá màu đen kỳ lạ, có các văn tự cổ đại khắc trên đó.\n\nKhi chạm vào viên đá, một luồng năng lượng khổng lồ đột nhiên tràn vào cơ thể anh!\n\n"AAAHHH!"\n\nDiệp Trần thét lên trong đau đớn, nhưng đồng thời cũng cảm nhận được sức mạnh đang tăng lên!\n\nViên đá hòa vào cơ thể anh, và một giọng nói vang lên trong đầu:\n\n"Ta là Võ Đế Thiên Hồng, ngươi là người kế thừa của ta..."',
245, 'bao vat co dai', true, NOW() - INTERVAL '6 months', 11800),

('c1111111-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 'Chương 3: Khai Khải Huyết Mạch', 'chuong-3-khai-khai-huyet-mach', 3,
'Trong không gian tâm thức, Diệp Trần gặp được linh hồn của Võ Đế Thiên Hồng.\n\n"Tiểu tử, ngươi có duyên với ta. Ta sẽ truyền cho ngươi Võ Đế tâm pháp, khai khải huyết mạch cho ngươi!"\n\nTrong vòng bảy ngày bảy đêm, Diệp Trần trải qua quá trình tái tạo thân thể đau đớn nhất.\n\nKhi mở mắt ra, anh đã hoàn toàn khác.\n\nCơ thể tràn đầy sức mạnh, huyết mạch tu luyện đã được khai khải!\n\n"Ta không còn là phế vật! Ta sẽ chứng minh với tất cả!"\n\nĐôi mắt Diệp Trần tỏa sáng quyết tâm.',
220, 'khai khai huyet mach', true, NOW() - INTERVAL '6 months', 10500);

-- Chapters for "Tình Yêu Không Có Lỗi" (first 5 chapters)
INSERT INTO chapters (
    id, novel_id, title, slug, chapter_number, content, word_count,
    normalized_title, is_published, published_at, view_count
) VALUES
('c2222222-0000-0000-0000-000000000001', 'd2222222-2222-2222-2222-222222222222', 'Chương 1: Gặp Gỡ', 'chuong-1-gap-go', 1,
'Lâm Tiểu Uyển vội vàng chạy trên phố, muộn giờ phỏng vấn rồi!\n\n"Xin lỗi! Xin lỗi!"\n\nCô va phải một người đàn ông cao lớn, hồ sơ rơi tung tóe.\n\n"Anh có mắt không?" Giọng nói lạnh lùng của người đàn ông.\n\nLâm Tiểu Uyển ngước nhìn, và giật mình. Người đàn ông này... đẹp trai quá!\n\nBộ vest đen sang trọng, gương mặt lạnh lùng nhưng hoàn hảo.\n\n"Tôi... tôi xin lỗi..."\n\nNhưng người đàn ông đã bước đi, để lại cô với đống hồ sơ trên đất.\n\nLâm Tiểu Uyển không biết rằng, đây chính là cuộc gặp gỡ định mệnh của đời cô.',
195, 'gap go', true, NOW() - INTERVAL '1 year', 8900),

('c2222222-0000-0000-0000-000000000002', 'd2222222-2222-2222-2222-222222222222', 'Chương 2: Phỏng Vấn', 'chuong-2-phong-van', 2,
'Tập đoàn Hàn Thị, tòa nhà cao 88 tầng sừng sững giữa thành phố.\n\nLâm Tiểu Uyển đến muộn 10 phút nhưng vẫn được cho phỏng vấn.\n\n"Cô Lâm Tiểu Uyển, 25 tuổi, tốt nghiệp đại học loại khá. Tại sao cô muốn làm việc tại đây?"\n\nTrưởng phòng nhân sự hỏi.\n\nLâm Tiểu Uyển trả lời thành thật: "Em cần một công việc ổn định để chăm sóc mẹ ốm của em."\n\nSau buổi phỏng vấn, cô được nhận vào làm trợ lý hành chính.\n\nNhưng cô không biết rằng, tổng giám đốc của tập đoàn chính là người đàn ông cô va phải sáng nay...',
210, 'phong van', true, NOW() - INTERVAL '1 year', 7800);

-- Chapters for "Trọng Sinh Chi Đô Thị Tu Tiên" (first 5 chapters)  
INSERT INTO chapters (
    id, novel_id, title, slug, chapter_number, content, word_count,
    normalized_title, is_published, published_at, view_count
) VALUES
('c3333333-0000-0000-0000-000000000001', 'd3333333-3333-3333-3333-333333333333', 'Chương 1: Trọng Sinh', 'chuong-1-trong-sinh', 1,
'Năm 2025, thành phố Thượng Hải.\n\nTrần Bắc trở về từ cái chết, mở mắt ra thấy mình đang nằm trong phòng học thời cấp ba!\n\n"Ta... trọng sinh rồi sao?"\n\nĐời trước, anh là Chân Vũ Đế Tôn, xưng bá tu tiên giới 500 năm. Nhưng bị đệ tử phản bội và chết trong trận quyết chiến cuối cùng.\n\nGiờ đây, anh trở về thời điểm 10 năm trước, khi còn là học sinh cấp ba bình thường.\n\n"Đời này, ta sẽ không để những thảm kịch lặp lại!"\n\nTrần Bắc quyết tâm, sử dụng kiến thức và tu vi từ tiền kiếp để thay đổi vận mệnh!',
230, 'trong sinh', true, NOW() - INTERVAL '18 months', 18500),

('c3333333-0000-0000-0000-000000000002', 'd3333333-3333-3333-3333-333333333333', 'Chương 2: Bắt Đầu Tu Luyện', 'chuong-2-bat-dau-tu-luyen', 2,
'Trần Bắc bắt đầu thu thập linh khí giữa đô thị hiện đại.\n\nMặc dù thời đại này linh khí khan hiếm, nhưng với kỹ thuật Đế Tôn của anh, vẫn có thể tu luyện được.\n\n"Thiên Địa Linh Khí Quyết!"\n\nAnh ngồi kiết già trong phòng, hấp thụ linh khí từ mặt trời mặt trăng.\n\nChỉ một đêm, anh đã phá vỡ tầng Luyện Khí thứ nhất!\n\n"Tốc độ tu luyện này, nếu để người khác biết sẽ kinh động cả tu tiên giới!"\n\nNhưng đây mới chỉ là bắt đầu. Anh còn phải đối mặt với vô số thử thách ở đời này.',
240, 'bat dau tu luyen', true, NOW() - INTERVAL '18 months', 17200);

-- More chapters for variety (adding recent chapters for trending novels)
INSERT INTO chapters (
    id, novel_id, title, slug, chapter_number, content, word_count,
    normalized_title, is_published, published_at, view_count
) VALUES
-- Recent chapter for Võ Thần Thiên Hạ
('c1111111-0000-0000-0000-000000000245', 'd1111111-1111-1111-1111-111111111111', 'Chương 245: Quyết Chiến Với Ma Đế', 'chuong-245-quyet-chien-voi-ma-de', 245,
'Trên đỉnh Thiên Sơn, Diệp Trần đối mặt với Ma Đế Huyền Thiên.\n\n"Tiểu tử, ngươi đã trưởng thành rất nhanh. Nhưng hôm nay, ngươi sẽ chết dưới tay ta!"\n\nMa Đế Huyền Thiên phóng ra ma khí tràn trời.\n\nDiệp Trần cười lạnh: "Muốn giết ta? Ngươi không đủ tư cách!"\n\nVõ Thần chi lực bùng nổ, cuộc quyết chiến kinh thiên động địa bắt đầu!',
165, 'quyet chien voi ma de', true, NOW() - INTERVAL '2 days', 8500),

-- Recent chapter for Trọng Sinh Chi Đô Thị Tu Tiên
('c3333333-0000-0000-0000-000000000520', 'd3333333-3333-3333-3333-333333333333', 'Chương 520: Xưng Bá Đô Thị', 'chuong-520-xung-ba-do-thi', 520,
'Sau khi đánh bại tất cả các thế lực ngầm, Trần Bắc chính thức trở thành bá chủ đô thị.\n\n"Từ nay, trong thành phố này, lời ta là luật!"\n\nNhưng anh biết, đây chỉ là khởi đầu. Tu tiên giới đang chờ đợi anh ở phía trước.\n\n"Sắp tới, ta sẽ trở lại tu tiên giới và giải quyết những ân oán đời trước!"',
145, 'xung ba do thi', true, NOW() - INTERVAL '1 day', 12800);

-- ============================================
-- 6. CHAPTER VIEWS (Sample view data)
-- ============================================
INSERT INTO chapter_views (chapter_id, novel_id, user_id, viewed_at, session_id, ip_hash, view_date)
SELECT 
    'c1111111-0000-0000-0000-000000000001',
    'd1111111-1111-1111-1111-111111111111',
    NULL,
    NOW() - (random() * INTERVAL '30 days'),
    'session_' || generate_series || '_' || floor(random() * 1000)::text,
    md5(random()::text),
    (NOW() - (random() * INTERVAL '30 days'))::date
FROM generate_series(1, 500);

INSERT INTO chapter_views (chapter_id, novel_id, user_id, viewed_at, session_id, ip_hash, view_date)
SELECT 
    'c3333333-0000-0000-0000-000000000001',
    'd3333333-3333-3333-3333-333333333333',
    NULL,
    NOW() - (random() * INTERVAL '30 days'),
    'session_' || generate_series || '_' || floor(random() * 1000)::text,
    md5(random()::text),
    (NOW() - (random() * INTERVAL '30 days'))::date
FROM generate_series(1, 800);

-- ============================================
-- 7. USER INTERACTION DATA (Requires authenticated users)
-- ============================================

-- Note: The following INSERT statements will only work after users are created in auth.users
-- For testing, you can create test users via Supabase Auth UI or API

-- Example structure (commented out until users exist):
/*
INSERT INTO bookmarks (id, user_id, novel_id) VALUES
('b1111111-1111-1111-1111-111111111111', 'USER_UUID_HERE', 'd1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'USER_UUID_HERE', 'd3333333-3333-3333-3333-333333333333');

INSERT INTO ratings (id, user_id, novel_id, rating, review_text) VALUES
('f1111111-1111-1111-1111-111111111111', 'USER_UUID_HERE', 'd1111111-1111-1111-1111-111111111111', 5, 'Truyện rất hay, cốt truyện hấp dẫn!'),
('f2222222-2222-2222-2222-222222222222', 'USER_UUID_HERE', 'd3333333-3333-3333-3333-333333333333', 5, 'Đỉnh cao của thể loại tu tiên đô thị!');

INSERT INTO reading_progress (id, user_id, novel_id, chapter_id, progress_percentage, scroll_position) VALUES
('01111111-1111-1111-1111-111111111111', 'USER_UUID_HERE', 'd1111111-1111-1111-1111-111111111111', 'c1111111-0000-0000-0000-000000000003', 60, 1200),
('02222222-2222-2222-2222-222222222222', 'USER_UUID_HERE', 'd3333333-3333-3333-3333-333333333333', 'c3333333-0000-0000-0000-000000000002', 100, 0);
*/

-- ============================================
-- 8. VERIFY SEED DATA
-- ============================================

-- Update aggregate fields manually for testing (normally done by triggers)
UPDATE novels SET 
    rating_average = 4.8,
    rating_count = 1250,
    bookmark_count = 890,
    total_chapters = 3,
    view_count_total = (SELECT COUNT(*) FROM chapter_views WHERE novel_id = 'd1111111-1111-1111-1111-111111111111')
WHERE id = 'd1111111-1111-1111-1111-111111111111';

UPDATE novels SET 
    total_chapters = 2
WHERE id = 'd2222222-2222-2222-2222-222222222222';

UPDATE novels SET 
    total_chapters = 2,
    view_count_total = (SELECT COUNT(*) FROM chapter_views WHERE novel_id = 'd3333333-3333-3333-3333-333333333333')
WHERE id = 'd3333333-3333-3333-3333-333333333333';

-- Update chapter view counts from chapter_views table
UPDATE chapters c SET view_count = (
    SELECT COUNT(*) FROM chapter_views cv WHERE cv.chapter_id = c.id
) WHERE c.novel_id IN (
    'd1111111-1111-1111-1111-111111111111',
    'd3333333-3333-3333-3333-333333333333'
);

-- Display summary
SELECT 
    'Seed Data Summary' as info,
    (SELECT COUNT(*) FROM authors) as authors_count,
    (SELECT COUNT(*) FROM genres) as genres_count,
    (SELECT COUNT(*) FROM novels) as novels_count,
    (SELECT COUNT(*) FROM chapters) as chapters_count,
    (SELECT COUNT(*) FROM chapter_views) as views_count;
