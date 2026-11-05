import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="auth-wrap">
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
