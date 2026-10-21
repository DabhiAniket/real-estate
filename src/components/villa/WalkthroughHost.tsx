"use client";

import dynamic from "next/dynamic";
import { useWalkthrough } from "@/lib/villa/walkthroughStore";

const WalkthroughOverlay = dynamic(() => import("./WalkthroughOverlay"), { ssr: false });

/** Mounts the full-screen walkthrough whenever any entry point opens it. */
export default function WalkthroughHost() {
  const { open, start } = useWalkthrough();
  if (!open || !start) return null;
  return <WalkthroughOverlay start={start} />;
}
