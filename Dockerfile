
FROM node:18 as builder
ENV ORIGIN=https://svelteauth.azurewebsites.net
ENV PRISMA_URI=prisma://aws-us-east-1.prisma-data.com/?api_key=xsmW1zupBZ69RgKOQEvhT8bm-PfCG1GmSNZE21c_Gzw8WX2fyZnei01aP6P--tz5
ENV MONGODB_URI=mongodb+srv://prisma1test:bdU_e6kt7TdXwbD@cluster0.3qjkyhr.mongodb.net/prismatest?retryWrites=true&w=majority
ENV GITHUB_ID=7124626d067af08f178b
ENV GITHUB_SECRET=0ab9407a6fbc82dd5834330b88c149acffb98972
ENV GOOGLE_CLIENT_SECRET=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
ENV GOOGLE_CLIENT_ID=590768943482-v03028iu9cvbde7td4uc5j3js4hpl5hm.apps.googleusercontent.com
ENV EMAIL_SERVER=smtp://bidhan@mail.bidhanniroula.com.np:4b25374d3aef32ceecdcd77207e6bc87-07ec2ba2-d64d9006@smtp.mailgun.org:587
ENV EMAIL_FROM=bidhanniroula@auth.com
ENV MAILGUN_DOMAIN=mail.bidhanniroula.com.np
ENV MAILGUN_API=9fb7430007a3bd7504d75ba61bb1c79e-07ec2ba2-809b8f7b
ENV AZ_ACCOUNT='DefaultEndpointsProtocol=https;AccountName=csg100320025d9d2a71;AccountKey=N2lvKfe6+4PRLBFlsrfTMoeO67oAE/Po9na5ZN9i/r5klygCRh6eT2bJyWnkB6ZmG27P/R+6S6Of+AStiHjoKA==;EndpointSuffix=core.windows.net'
ENV AUTH_SECRET=9e115f1d9c691a9c6ee06ca1eafa5abab0aa657c6ea3ace54ef28ff9c0bbf553
ENV AUTH_TRUST_HOST=https://svelteauth.azurewebsites.net
ENV PRISMA_GENERATE_DATAPROXY=true
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn 
COPY . .
RUN npx prisma generate --data-proxy
RUN yarn build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["yarn","start"]