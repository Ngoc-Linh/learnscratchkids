import { getUser } from "@/lib/auth";
import { handler, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await getUser();
  return json({ user });
});
