<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import {
    Card,
    FloatingLabelInput,
    GradientButton,
    Helper,
  } from "flowbite-svelte";
  import type { ActionData } from "./$types.js";
  import { signOut } from "@auth/sveltekit/client";
  import { page } from "$app/stores";
  import DeleteIcon from "../../components/DeleteIcon.svelte";
  export let data;
  export let form: ActionData;
</script>

<div class="w-full flex justify-center mt-4">
  <div class="flex flex-col w-[400px] gap-4">
    <div class="flex w-full justify-center gap-x-3">
      {#if $page.data.session}
        <h1>Logged in user :</h1>
        <span>
          {$page.data.session.user?.name}
        </span>
      {/if}
    </div>

    <GradientButton color="purpleToBlue" on:click={() => signOut()}
      >Logout</GradientButton
    >
  </div>
</div>
<div class="flex flex-col items-center mt-4 justify-center w-full">
  <form
    action="?/create"
    method="post"
    use:enhance
    class="flex flex-col gap-4 items-center justify-center w-56"
  >
    <div>
      <FloatingLabelInput
        autocomplete="off"
        style="outlined"
        id="title"
        name="title"
        type="text"
        label="Title"
        value={form?.title?.toString() || ""}
      />
      {#if form?.zodErr}
        <Helper color="red">
          <span class="font-medium">
            {form?.zodError?.fieldErrors?.title[0]}
          </span>
        </Helper>
      {/if}
    </div>
    <div>
      <FloatingLabelInput
        autocomplete="off"
        style="outlined"
        id="content"
        name="content"
        type="text"
        label="Content"
        value={form?.content?.toString() || ""}
      />
      {#if form?.zodErr}
        <Helper color="red">
          <span class="font-medium">
            {form?.zodError?.fieldErrors.content[0]}
          </span>
        </Helper>
      {/if}
    </div>
    <FloatingLabelInput
      autocomplete="off"
      style="outlined"
      id="Image"
      name="image"
      type="file"
      label="Image"
    />
    <GradientButton outline color="tealToLime" type="submit"
      >Submit</GradientButton
    >
    {#if form?.success}
      <p class="text-md text-green-500">Success!</p>
    {:else if form?.err}
      <p class="text-md text-red-500">{form?.error}</p>
    {/if}
  </form>
</div>

<div
  class="grid gap-4 mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center"
>
  {#if data.streamed?.posts}
    {#await data.streamed?.posts}
      <p>Loading...</p>
    {:then data}
      {#if data.length > 0}
        {#each data as post (post.id)}
          <Card class="relative">
            <img src={post.image} alt="" />
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <div>
              <form action="?/delete" method="post" use:enhance>
                <input type="hidden" name="id" value={post.id} />
                <button class="absolute bottom-0 right-1">
                  <DeleteIcon className="dark:fill-white" />
                </button>
              </form>
            </div>
          </Card>
        {/each}
      {:else}
        <p>No posts found.</p>
      {/if}
    {/await}
  {/if}
</div>
