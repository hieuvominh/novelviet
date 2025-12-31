"use client";

import { useState } from "react";

export default function AdminChapters() {
  const [selectedNovel, setSelectedNovel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const chapters = [
    {
      id: 1,
      novel: "Võ Thần Thiên Hạ",
      chapterNumber: 1250,
      title: "Đại Chiến Cuối Cùng",
      wordCount: 3200,
      views: 45000,
      publishedAt: "2024-12-30 10:00",
    },
    {
      id: 2,
      novel: "Võ Thần Thiên Hạ",
      chapterNumber: 1249,
      title: "Quyết Chiến",
      wordCount: 2950,
      views: 52000,
      publishedAt: "2024-12-29 10:00",
    },
    {
      id: 3,
      novel: "Trọng Sinh Chi Đô Thị Tu Tiên",
      chapterNumber: 980,
      title: "Bước Vào Thần Cảnh",
      wordCount: 3100,
      views: 38000,
      publishedAt: "2024-12-30 08:00",
    },
    {
      id: 4,
      novel: "Huyết Sắc Lãng Mạn",
      chapterNumber: 520,
      title: "Tình Yêu Và Nghĩa Vụ",
      wordCount: 2800,
      views: 22000,
      publishedAt: "2024-12-30 06:00",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chapters</h1>
          <p className="text-gray-600 mt-1">
            Manage all chapters across novels
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Add Chapter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Chapters</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">156,234</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Published Today</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">125</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Avg Word Count</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">2,850</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters by title, number..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Novel Filter */}
          <select
            value={selectedNovel}
            onChange={(e) => setSelectedNovel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Novels</option>
            <option value="1">Võ Thần Thiên Hạ</option>
            <option value="2">Trọng Sinh Chi Đô Thị Tu Tiên</option>
            <option value="3">Huyết Sắc Lãng Mạn</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Novel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ch #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Words
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {chapters.map((chapter) => (
              <tr key={chapter.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{chapter.novel}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {chapter.chapterNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{chapter.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {chapter.wordCount}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {chapter.views.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {chapter.publishedAt}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing 1-4 of 156,234 chapters
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
