import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/templates";
import { TemplateEditor } from "@/components/TemplateEditor";

export default async function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplate(id);
  if (!template) notFound();
  return <TemplateEditor template={template} />;
}
