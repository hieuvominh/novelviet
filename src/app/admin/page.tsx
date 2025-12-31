"use client";

export default function AdminDashboard() {
  // Mock stats data
  const stats = [
    { label: "Total Novels", value: "2,458", change: "+12.5%", trend: "up" },
    { label: "Total Chapters", value: "156,234", change: "+8.2%", trend: "up" },
    { label: "Total Authors", value: "542", change: "+3.1%", trend: "up" },
    { label: "Daily Views", value: "1.2M", change: "-2.3%", trend: "down" },
  ];

  const recentActivity = [
    {
      action: "New novel published",
      item: "Võ Thần Thiên Hạ",
      time: "2 mins ago",
    },
    { action: "Chapter updated", item: "Chapter 1250", time: "5 mins ago" },
    {
      action: "New author added",
      item: "Thiên Tàm Thổ Đậu",
      time: "15 mins ago",
    },
    { action: "Genre created", item: "Xuanhuan", time: "1 hour ago" },
    {
      action: "Novel edited",
      item: "Trọng Sinh Chi Đô Thị",
      time: "2 hours ago",
    },
  ];

  const topNovels = [
    { title: "Võ Thần Thiên Hạ", views: "2.5M", chapters: 1250, rating: 4.8 },
    {
      title: "Trọng Sinh Chi Đô Thị",
      views: "1.8M",
      chapters: 980,
      rating: 4.7,
    },
    {
      title: "Tình Yêu Không Có Lỗi",
      views: "1.2M",
      chapters: 680,
      rating: 4.6,
    },
    { title: "Huyết Sắc Lãng Mạn", views: "890K", chapters: 520, rating: 4.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div
                className={`text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      {activity.action}
                    </div>
                    <div className="text-sm text-gray-600">{activity.item}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Novels */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Novels</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topNovels.map((novel, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {novel.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {novel.chapters} chapters • {novel.views} views
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium text-gray-900">
                      {novel.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Add Novel
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            + Add Author
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            + Add Genre
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            + Add Chapter
          </button>
        </div>
      </div>
    </div>
  );
}
