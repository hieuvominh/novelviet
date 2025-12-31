"use client";

import { useState } from "react";

export default function AdminAuthors() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const authors = [
    {
      id: 1,
      name: "Thiên Tàm Thổ Đậu",
      slug: "thien-tam-tho-dau",
      novelCount: 15,
      totalChapters: 8542,
      totalViews: "25M",
      avgRating: 4.7,
    },
    {
      id: 2,
      name: "Ngã Ái Đại Mễ Miểu",
      slug: "nga-ai-dai-me-mieu",
      novelCount: 8,
      totalChapters: 4230,
      totalViews: "18M",
      avgRating: 4.6,
    },
    {
      id: 3,
      name: "Cố Mạn",
      slug: "co-man",
      novelCount: 12,
      totalChapters: 3850,
      totalViews: "12M",
      avgRating: 4.5,
    },
    {
      id: 4,
      name: "Dạ Thần Cánh",
      slug: "da-than-canh",
      novelCount: 6,
      totalChapters: 2940,
      totalViews: "9M",
      avgRating: 4.4,
    },
    {
      id: 5,
      name: "Hạ Thập Nhị",
      slug: "ha-thap-nhi",
      novelCount: 10,
      totalChapters: 5120,
      totalViews: "15M",
      avgRating: 4.8,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600 mt-1">Manage novel authors</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Add Author
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Authors</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">542</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Active Authors</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">387</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Avg Novels/Author</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">4.5</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Top Rated</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">⭐ 4.8</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search authors by name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Novels
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chapters
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {author.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 font-mono">
                    {author.slug}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {author.novelCount}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {author.totalChapters.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {author.totalViews}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-gray-900">{author.avgRating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      Novels
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
        <div className="text-sm text-gray-600">Showing 1-5 of 542 authors</div>
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
