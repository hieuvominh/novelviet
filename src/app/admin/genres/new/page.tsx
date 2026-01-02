import GenreForm from "@/components/admin/genres/genre-form";

export default function NewGenrePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Genre</h1>
      </div>
      <GenreForm mode="create" />
    </div>
  );
}
