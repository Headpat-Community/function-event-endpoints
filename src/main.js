import { Client, Databases, Account } from "node-appwrite";
import { getEvents } from "./utils/event-actions.js";

export const client = new Client();
export const account = new Account(client);
export const databases = new Databases(client);


export { ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  client
    .setEndpoint(`${process.env.APPWRITE_API_URL}/v1`)
    .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
    .setJWT(req.headers["x-appwrite-user-jwt"] || "");

  const userId = req.headers["x-appwrite-user-id"];

  if (req.method === "GET") {
    log(req);
    switch (req.path) {
      case "/getEvents":
        const userEvents = await getEvents();
        if (!userEvents) {
          return res.send("Error fetching user data");
        }
        return res.json(userEvents);
      default:
        return res.json("No peeking.");
    }
  }
};
