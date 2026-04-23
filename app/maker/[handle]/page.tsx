import MakerBoot from "@/components/MakerBoot";

export default function MakerPage({ params }: { params: { handle: string } }) {
  return <MakerBoot handle={decodeURIComponent(params.handle)} />;
}
