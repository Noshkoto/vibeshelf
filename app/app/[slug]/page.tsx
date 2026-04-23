import DetailBoot from "@/components/DetailBoot";

export default function AppDetailPage({ params }: { params: { slug: string } }) {
  return <DetailBoot slug={params.slug} />;
}
