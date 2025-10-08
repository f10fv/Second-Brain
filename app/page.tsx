import { Button } from "@/components/ui/button" 
import { Poppins } from "next/font/google";
import {cn} from '@/lib/utils'
import { LoginButton } from "@/components/auth/login-button";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });
export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-[#000000b6]">
      <div className="space-y-6 text-center">
        <h1 className={cn("text-5xl font-semibold text-white drop-shadow-md", font.className)}>Second Brain</h1>
      </div>
      <div className="mt-5">
        <LoginButton>
        <Button variant="secondary" size="default">Sign in</Button>
        </LoginButton>
      </div>
    </main>
  );
}
  