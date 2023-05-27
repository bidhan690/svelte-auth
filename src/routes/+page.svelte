<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button, GradientButton } from "flowbite-svelte";
  import { signIn, signOut } from "@auth/sveltekit/client";
  // async function handle(type: string) {
  //   if (type === "login") {
  //     await fetch("/login");
  //     goto("/admin", {
  //       invalidateAll: true,
  //     });
  //   }
  //   if (type === "logout") await fetch("/logout");
  // }
</script>

<div
  class="text-5xl text-indigo-500 flex items-center gap-8 justify-center h-screen font-[600] text-transparent bg-clip-text bg-gradient-to-br from-[#a22fce] to-[#ff7000]"
>
  <GradientButton size="lg" color="purpleToBlue" href="/auth/signin"
    >Login</GradientButton
  >
  <GradientButton size="lg" color="purpleToPink" on:click={() => signOut()}
    >Logout</GradientButton
  >
</div>
s
