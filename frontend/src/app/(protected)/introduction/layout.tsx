import { Metadata } from "next";
import "@/styles/globals.css";
export const metadata: Metadata = {
  title: "EduAion - Khám Phá Học Tiếng Anh",
  description: "Khám phá cách học tiếng Anh thông minh với AI.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}