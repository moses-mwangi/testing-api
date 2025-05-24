// import { Provider } from "oidc-provider";
// import { config } from "dotenv";
// config();

// const clients = [
//   {
//     client_id: process.env.CLIENT_ID,
//     client_secret: process.env.CLIENT_SECRET,
//     grant_types: ["authorization_code", "refresh_token"],
//     redirect_uris: [process.env.REDIRECT_URI],
//   },
// ];

// const features = {
//   introspection: { enabled: true },
//   revocation: { enabled: true },
// };

// const oidc = new Provider("https://auth.mycompany.com", {
//   clients,
//   formats: {
//     AccessToken: "jwt",
//   },
//   features,
// });

// export default oidc;
