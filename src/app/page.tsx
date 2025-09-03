import Image from "next/image";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { getCurrentSession } from "@/actions";
import { LogoutButton } from "@/components/LogoutButton";
import { globalGETRateLimit } from "@/lib/requests";

export default async function ProfileContent(): Promise<JSX.Element | string> {
  if (!(await globalGETRateLimit())) {
    return "Too many requests";
  }

  const { user, session } = await getCurrentSession();

  if (session === null) return redirect("/login");

  return (
    <>
      <h1>{user.name}</h1>
      <Image src={user.picture} alt="profile" height={100} width={100} />
      <p>{user.email}</p>
      <LogoutButton />
    </>
  );
}
