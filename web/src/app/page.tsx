"use client";

import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/brand/SplashScreen";

export default function HomePage() {
  const router = useRouter();
  return <SplashScreen onEnter={() => router.push("/app")} />;
}
