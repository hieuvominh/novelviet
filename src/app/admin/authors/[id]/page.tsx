import { createClient } from "@/lib/supabase/server";
import AuthorForm from "@/components/admin/author-form";

type Props = { params: { id: string } };

export default async function EditAuthorPage({ params }: Props) {
  const supabase = await createClient();

  // Resolve params if it's a Promise-like (RSC streaming / Turbopack dev)
  // sometimes params arrives wrapped as a thenable; handle that gracefully.
  let resolvedParams: any = params;
  try {
    if (params && typeof (params as any).then === "function") {
      // eslint-disable-next-line no-console
      console.log("[EditAuthorPage] params is thenable, awaiting...");
      resolvedParams = await (params as any);
      // eslint-disable-next-line no-console
      console.log("[EditAuthorPage] resolved params:", resolvedParams);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[EditAuthorPage] error resolving params:", e);
    resolvedParams = params;
  }
  try {
    const u = await supabase.auth.getUser();
    // eslint-disable-next-line no-console
    console.log("[EditAuthorPage] supabase user:", u);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[EditAuthorPage] error fetching user:", e);
  }

  // Use resolved params for DB queries (handle thenable params)
  const id = resolvedParams?.id ?? params?.id;

  // Try to fetch non-deleted author, fallback if deleted_at missing
  let author: any = null;
  try {
    // Log the incoming param
    // eslint-disable-next-line no-console
    console.log("[EditAuthorPage] resolved id:", id);

    // Defensive: ensure we have a valid id before querying the DB
    if (!id) {
      // eslint-disable-next-line no-console
      console.error("[EditAuthorPage] missing author id, aborting DB fetch", {
        params,
        resolvedParams,
      });
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Author not found</h1>
          <p className="text-sm text-gray-600">
            Missing author id in route params.
          </p>
          <pre className="mt-2 text-xs text-gray-700 bg-gray-50 border rounded p-2">
            {JSON.stringify({ params, resolvedParams })}
          </pre>
        </div>
      );
    }

    const res = await supabase
      .from("authors")
      .select("id, name, slug, bio")
      .is("deleted_at", null)
      .eq("id", id)
      .maybeSingle();

    // eslint-disable-next-line no-console
    console.log("[EditAuthorPage] primary fetch result:", res);

    if (res.error) {
      const msg = res.error.message || String(res.error);
      // eslint-disable-next-line no-console
      console.log("[EditAuthorPage] primary fetch error message:", msg);
      if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
        throw res.error;
      }
    }

    author = res.data;
  } catch (err) {
    try {
      const res2 = await supabase
        .from("authors")
        .select("id, name, slug, bio, deleted_at")
        .eq("id", id)
        .maybeSingle();

      // eslint-disable-next-line no-console
      console.log("[EditAuthorPage] fallback fetch result:", res2);

      if (res2.error || !res2.data) {
        // eslint-disable-next-line no-console
        console.error(
          "Error fetching author for edit (fallback):",
          res2.error || "no data"
        );
        author = null;
      } else {
        author = res2.data;
      }
    } catch (err2) {
      // eslint-disable-next-line no-console
      console.error(
        "Unexpected error fetching author for edit fallback:",
        err2
      );
      author = null;
    }
  }

  if (!author) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Author not found</h1>
        <p className="text-sm text-gray-600">
          The requested author was not found or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Author</h1>
        <p className="text-sm text-gray-600">Update author details</p>
      </div>
      {/* @ts-expect-error Server -> Client prop */}
      <AuthorForm
        mode="edit"
        initial={{
          id: author.id,
          name: author.name,
          slug: author.slug,
          bio: author.bio,
        }}
      />
    </div>
  );
}
