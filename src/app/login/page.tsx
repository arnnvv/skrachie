import type { JSX } from "react";

export default function LoginPage(): JSX.Element {
  return (
    <>
      <a href="/login/google">Sign in with Google</a>
      <br />
      <a href="/login/github">Sign in with GitHub</a>
    </>
  );
}
