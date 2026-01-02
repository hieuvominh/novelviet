import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch counts using head select for exact counts
  const novelsRes = await supabase
    .from("novels")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);
  const chaptersRes = await supabase
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);
  const authorsRes = await supabase
    .from("authors")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);

  const novelsCount = novelsRes.count ?? 0;
  const chaptersCount = chaptersRes.count ?? 0;
  const authorsCount = authorsRes.count ?? 0;

  // Top novels by view_count_total
  let topNovels: any[] = [];
  try {
    const topRes = await supabase
      .from("novels")
      .select("title, view_count_total, total_chapters, rating_average")
      .is("deleted_at", null)
      .order("view_count_total", { ascending: false })
      .limit(4);
    topNovels = topRes.data || [];
  } catch {
    topNovels = [];
  }

  // Recent activity: recent novel updates
  let recentActivity: any[] = [];
  try {
    const recentRes = await supabase
      .from("novels")
      .select("title, updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(5);
    recentActivity = (recentRes.data || []).map((r: any) => ({
      action: "Novel updated",
      item: r.title,
      time: r.updated_at,
    }));
  } catch {
    recentActivity = [];
  }

  const stats = [
    {
      label: "Total Novels",
      value: novelsCount.toLocaleString(),
      change: "",
      trend: "up",
    },
    {
      label: "Total Chapters",
      value: chaptersCount.toLocaleString(),
      change: "",
      trend: "up",
    },
    {
      label: "Total Authors",
      value: authorsCount.toLocaleString(),
      change: "",
      trend: "up",
    },
    { label: "Total Views", value: "—", change: "", trend: "up" },
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
              {topNovels.map((novel: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {novel.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {novel.total_chapters || novel.total_chapters} chapters •{" "}
                      {novel.view_count_total ?? novel.view_count_total} views
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium text-gray-900">
                      {novel.rating_average ?? "—"}
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
          <a
            href="/admin/novels/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Novel
          </a>
          <a
            href="/admin/authors/new"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Add Author
          </a>
          <a
            href="/admin/genres/new"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Add Genre
          </a>
          <a
            href="/admin/chapters/new"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Add Chapter
          </a>
        </div>
      </div>
    </div>
  );
}
