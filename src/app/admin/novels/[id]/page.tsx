import NovelForm from "@/components/admin/novel-form";

export default async function AdminNovelEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <NovelForm mode="edit" novelId={id} />;
}
