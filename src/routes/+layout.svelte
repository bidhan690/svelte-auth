<script>
  import "../app.css";
  import {
    Button,
    DarkMode,
    NavBrand,
    NavHamburger,
    NavLi,
    NavUl,
    Navbar,
  } from "flowbite-svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let activePath = "/";

  $: activePath = $page.url.pathname;
</script>

<Navbar let:hidden let:toggle>
  <NavBrand href="/">
    <img
      src="https://flowbite.com/docs/images/logo.svg"
      class="mr-3 h-6 sm:h-9"
      alt="Flowbite Logo"
    />
    <span
      class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
    >
      Svelte
    </span>
  </NavBrand>
  <div class="flex md:order-1">
    <DarkMode />
    <NavHamburger on:click={toggle} />
  </div>
  <NavUl {hidden}>
    <NavLi href="/" active={activePath === "/"}>Home</NavLi>
    <NavLi href="/admin" active={activePath === "/admin"}>Admin</NavLi>
  </NavUl>
</Navbar>

<slot />
