import { Client, Databases } from "node-appwrite";
import { getEvent, getEvents, getNextEvent, getUpcomingEvents } from './utils/event-actions.js'

export const client = new Client();
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
      case '/getEvent':
        const event = await getEvent(req.query);
        if (!event) {
          return res.send("Error fetching user data");
        }
        return res.json(event);
      case '/getNextEvent':
        const nextEvent = await getNextEvent();
        if (!nextEvent) {
          return res.send("Error fetching user data");
        }
        return res.json(event);
      case '/getEvents':
        const events = await getEvents();
        if (!events) {
          return res.send("Error fetching user data");
        }
        return res.json(events);
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
