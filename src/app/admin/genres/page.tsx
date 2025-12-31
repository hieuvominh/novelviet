"use client";

export default function AdminGenres() {
  // Mock data
  const genres = [
    {
      id: 1,
      name: "Huyền Huyễn",
      slug: "huyen-huyen",
      novelCount: 458,
      parent: null,
    },
    { id: 2, name: "Võ Hiệp", slug: "vo-hiep", novelCount: 325, parent: null },
    {
      id: 3,
      name: "Ngôn Tình",
      slug: "ngon-tinh",
      novelCount: 612,
      parent: null,
    },
    { id: 4, name: "Tu Tiên", slug: "tu-tien", novelCount: 389, parent: null },
    { id: 5, name: "Đô Thị", slug: "do-thi", novelCount: 274, parent: null },
    {
      id: 6,
      name: "Kiếm Hiệp",
      slug: "kiem-hiep",
      novelCount: 198,
      parent: "Võ Hiệp",
    },
    { id: 7, name: "Cổ Đại", slug: "co-dai", novelCount: 156, parent: null },
    {
      id: 8,
      name: "Khoa Huyễn",
      slug: "khoa-huyen",
      novelCount: 142,
      parent: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Genres</h1>
          <p className="text-gray-600 mt-1">
            Manage novel genres and categories
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Add Genre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Genres</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">28</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Parent Genres</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">18</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Sub Genres</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">10</div>
        </div>
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
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Novel Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {genres.map((genre) => (
              <tr key={genre.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {genre.parent && <span className="text-gray-400">↳</span>}
                    <div className="text-sm font-medium text-gray-900">
                      {genre.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 font-mono">
                    {genre.slug}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {genre.parent ? (
                    <span className="text-sm text-gray-600">
                      {genre.parent}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {genre.novelCount}
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

      {/* Genre Hierarchy Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Genre Hierarchy
        </h2>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-gray-900">📚 Võ Hiệp (325)</div>
          <div className="ml-6 text-gray-600">↳ Kiếm Hiệp (198)</div>
          <div className="font-medium text-gray-900 mt-4">
            📚 Huyền Huyễn (458)
          </div>
          <div className="ml-6 text-gray-600">↳ Đông Phương (156)</div>
          <div className="ml-6 text-gray-600">↳ Tây Phương (98)</div>
        </div>
      </div>
    </div>
  );
}
