import { createFileRoute } from "@tanstack/react-router";
import { Watchbar } from "@/components/watchbar";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <Watchbar />;
}
