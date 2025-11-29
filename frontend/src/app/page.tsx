import { redirect } from "next/navigation";
export default function Home() {
  redirect("/introduction"); // Redirect đến IntroPage
}