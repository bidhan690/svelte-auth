import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { prisma } from "$lib/server/prisma";
import { AZ_ACCOUNT } from "$env/static/private";
import { BlobServiceClient } from "@azure/storage-blob";
import { nanoid } from "nanoid";

export async function load({ parent }) {
  const { session } = await parent();
  const user = session?.user;
  try {
    const users = async () => {
      const data = await prisma.post.findMany({
        where: {
          authorEmail: user?.email as string,
        },
      });

      await prisma.$disconnect();
      return data.reverse();
    };

    return {
      streamed: {
        posts: users(),
      },
    };
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    // process.exit(1);
  }
}

const createUserSchema = z.object({
  title: z.string().nonempty("Title is required"),
  content: z.string().nonempty("Content is required"),
});

export const actions = {
  create: async ({ request, locals }) => {
    const session = await locals.getSession();

    const formData = Object.fromEntries(await request.formData());
    const { title, content, image } = formData;
    let imageUrl;
    if (image.size > 0) {
      imageUrl = await uploadImage(image);
    }

    try {
      createUserSchema.parse(formData);
      const post = await prisma.post.create({
        data: {
          title: formData.title as string,
          content: formData.content as string,
          authorEmail: session?.user?.email as string,
          image: imageUrl ?? "",
        },
      });
      return {
        post,
        success: true,
      };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return fail(400, {
          title,
          content,
          zodError: err.flatten() as any,
          zodErr: true,
        });
      }
      if (err.code === "P2002") {
        return fail(400, {
          title,
          content,
          error: "Post already exists",
          err: true,
        });
      }

      return fail(400, {
        title,
        content,
        error: JSON.stringify(err),
        err: true,
      });
    }
  },
  delete: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());
    const post = await prisma.post.delete({
      where: {
        id: formData.id.toString(),
      },
    });
  },
};

async function uploadImage(image: any) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZ_ACCOUNT);
  const containerClient = blobServiceClient.getContainerClient("sveltetest");

  const blobName = nanoid() + image.name;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const buffer = new Uint8Array(await image.arrayBuffer()) as any;
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: image.type },
  });

  return blockBlobClient.url;
}
