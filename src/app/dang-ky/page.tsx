import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Tạo tài khoản" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getUser()) redirect("/tai-khoan");
  return (
    <div className="container-page py-14">
      <AuthForm mode="register" />
    </div>
  );
}
