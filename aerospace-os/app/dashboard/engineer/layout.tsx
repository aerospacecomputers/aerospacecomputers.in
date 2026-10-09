import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default async function EngineerDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "engineer") {
    if (session.role === "admin") redirect("/dashboard/admin");
    if (session.role === "customer") redirect("/dashboard/customer");
    redirect("/login");
  }
  return children;
}
