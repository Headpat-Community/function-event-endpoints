import { Client, Databases, Account } from "node-appwrite";
import { getUpcomingEvents } from "./utils/event-actions.js";

export const client = new Client();
export const account = new Account(client);
export const databases = new Databases(client);


export { ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const userId = req.headers["x-appwrite-user-id"];

  client
    .setEndpoint(`${process.env.APPWRITE_API_URL}/v1`)
    .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
    .setJWT(userId || "");

  if (req.method === "GET") {
    switch (req.path) {
      case "/getUpcomingEvents":
        const upcomingEvents = await getUpcomingEvents();
        if (!upcomingEvents) {
          return res.send("Error fetching user data");
        }
        return res.json(upcomingEvents);
      default:
        return res.json("No peeking.");
    }
  }
};
