import { ChatView } from "@/components/chat/ChatView";

export default function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  return <ChatView threadIdFromUrl={params.then((p) => p.threadId)} />;
}
