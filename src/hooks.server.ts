import { redirect, type Handle } from "@sveltejs/kit";
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import {
  GITHUB_ID,
  GITHUB_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  EMAIL_SERVER,
  EMAIL_FROM,
  AUTH_SECRET,
} from "$env/static/private";
import { sequence } from "@sveltejs/kit/hooks";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "$lib/server/prisma";
import Email from "@auth/core/providers/email";
import { createTransport } from "nodemailer";

async function authorization({ event, resolve }) {
  if (event.url.pathname.startsWith("/admin")) {
    const session = await event.locals.getSession();
    if (!session) {
      throw redirect(303, "/");
    }
  }

  return resolve(event);
}

export const handle: Handle = sequence(
  SvelteKitAuth({
    adapter: PrismaAdapter(prisma),

    pages: {
      signOut: "/admin",
    },
    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60,
    },

    providers: [
      GitHub({
        clientId: GITHUB_ID,
        clientSecret: GITHUB_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      Google({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      Email({
        async sendVerificationRequest({
          identifier,
          provider,
          theme,
          token,
          url,
        }) {
          const user = await prisma.user.findUnique({
            where: {
              email: identifier,
            },
          });

          if (user) {
            const { host } = new URL(url);
            // NOTE: You are not required to use `nodemailer`, use whatever you want.
            const transport = createTransport(provider.server);
            const result = await transport.sendMail({
              to: identifier,
              from: provider.from,
              subject: `Sign in to ${host}`,
              text: text({ url, host }),
              html: html({ url, host, theme }),
            });
            const failed = result.rejected
              .concat(result.pending)
              .filter(Boolean);
            if (failed.length) {
              throw new Error(
                `Email(s) (${failed.join(", ")}) could not be sent`
              );
            }
          } else {
            throw new Error("User not found");
          }
        },
        server: EMAIL_SERVER,
        from: EMAIL_FROM,
        secret: AUTH_SECRET,
      }),
    ],
    trustHost: true,
  }),
  authorization
);

function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}

// async sendVerificationRequest({ identifier }) {
//   const user = await prisma.user.findUnique({
//     where: {
//       email: identifier,
//     },
//   });

//   if (user) {
//     return user;
//   } else {
//     console.log("User not found. Please sign up first.");
//     return null;
//   }
// },
