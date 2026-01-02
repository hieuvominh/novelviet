import AuthorForm from "@/components/admin/author-form";

export default function NewAuthorPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Author</h1>
        <p className="text-sm text-gray-600">Add a new author</p>
      </div>
      <AuthorForm mode="create" />
    </div>
  );
}
