import { Suspense } from "react";
import PageContent from "@/components/tweet-board/PageContent";
import LoadingState from "@/components/shared/LoadingState";

export default function NewsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PageContent />
    </Suspense>
  );
}
