import { Client, Databases } from "node-appwrite";
import {
  getArchivedEvents,
  getEvent,
  getEvents,
  getNextEvent,
  getUpcomingEvents,
} from "./utils/event-actions.js";

export const client = new Client();
export const databases = new Databases(client);

export { ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const userId = req.headers["x-appwrite-user-id"];

  client
    .setEndpoint(`${process.env.APPWRITE_API_URL}/v1`)
    .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
    .setJWT(req.headers["x-appwrite-user-jwt"] || "");

  if (req.method === "GET") {
    switch (req.path) {
      case "/getEvent":
        const event = await getEvent(req.query);
        return res.json(event);
      case "/getNextEvent":
        const nextEvent = await getNextEvent();
        return res.json(nextEvent);
      case "/getEvents":
        const events = await getEvents();
        return res.json(events);
      case "/getUpcomingEvents":
        const upcomingEvents = await getUpcomingEvents();
        return res.json(upcomingEvents);
      case "/getArchivedEvents":
        const archivedEvents = await getArchivedEvents();
        return res.json(archivedEvents);
      default:
        return res.json("No peeking.");
    }
  }
};
