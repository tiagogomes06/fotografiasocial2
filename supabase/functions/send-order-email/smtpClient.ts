import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const createSMTPClient = () => new SMTPClient({
  connection: {
    hostname: "mail.duploefeito.com",
    port: 465,
    tls: true,
    auth: {
      username: "encomendas@duploefeito.com",
      password: Deno.env.get('SMTP_PASSWORD'),
    },
  },
});

export { createSMTPClient };