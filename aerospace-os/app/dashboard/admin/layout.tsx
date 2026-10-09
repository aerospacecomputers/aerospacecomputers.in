import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    if (session.role === "customer") {
      redirect("/dashboard/customer");
    }

    if (session.role === "engineer") {
      redirect("/dashboard/engineer");
    }

    redirect("/login");
  }

  return children;
}
