import { Client, Account, Databases } from "node-appwrite";
import {
  getArchivedEvents,
  getEvent,
  getEventAttendees,
  getEvents,
  getNextEvent,
  getUpcomingEvents,
  postEventAttendee,
} from "./utils/event-actions.js";

const client = new Client();
export const account = new Account(client);
export const databases = new Databases(client);

const clientAdmin = new Client();
export const databasesAdmin = new Databases(clientAdmin);

export { ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const userId = req.headers["x-appwrite-user-id"];

  client
    .setEndpoint(`${process.env.APPWRITE_API_URL}/v1`)
    .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
    .setJWT(req.headers["x-appwrite-user-jwt"] || "");

  clientAdmin
    .setEndpoint(`${process.env.APPWRITE_API_URL}/v1`)
    .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
    .setKey(req.headers["x-appwrite-key"]);

  if (req.method === "GET") {
    switch (req.path) {
      case "/event":
        const event = await getEvent(req.query, error);
        return res.json(event);
      case "/event/attendees":
        const eventAttendees = await getEventAttendees(
          req.query,
          error,
          userId,
        );
        return res.json(eventAttendees);
      case "/event/next":
        const nextEvent = await getNextEvent(error);
        return res.json(nextEvent);
      case "/events":
        const events = await getEvents(req.query, error);
        return res.json(events);
      case "/events/upcoming":
        const upcomingEvents = await getUpcomingEvents(req.query, error);
        return res.json(upcomingEvents);
      case "/events/archived":
        const archivedEvents = await getArchivedEvents(req.query, error);
        return res.json(archivedEvents);
      default:
        return res.json("No peeking.");
    }
  } else if (req.method === "POST") {
    switch (req.path) {
      case "/event":
        return res.json("Not implemented.");
      case "/event/attendee":
        const attendee = await postEventAttendee(userId, req.query, error);
        return res.json(attendee);
      default:
        return res.json("No peeking.");
    }
  }
};
