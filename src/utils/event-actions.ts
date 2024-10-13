import {databases, databasesAdmin} from "../main.js";
import { Query } from "node-appwrite";
import { handleError } from "./errorHandler.js";

export async function getEvent(query: { eventId: string }) {
  try {
    const event = await databases.getDocument("hp_db", "events", query.eventId);
    const attendees = await databasesAdmin.listDocuments("hp_db", "events-attendees", [
      Query.equal("eventId", query.eventId),
    ]);
    return { ...event, attendees: attendees.documents };
  } catch (error) {
    return handleError("Error fetching event", "event-fetch-error", 500);
  }
}

export async function getNextEvent() {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("date", currentDate.toISOString()),
    ]);

    if (data.documents.length === 0) {
      return data.documents;
    }

    return data.documents.filter((event) => {
      const eventDateUntil = new Date(event.dateUntil);
      return eventDateUntil > currentDate;
    })[0];
  } catch (error) {
    return handleError(
      "Error fetching next events",
      "events_next_fetch-error",
      500,
    );
  }
}

export async function getEvents() {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("dateUntil", currentDate.toISOString()),
      Query.lessThanEqual("date", currentDate.toISOString()),
    ]);

    return data.documents.filter((event) => {
      const eventDateUntil = new Date(event.dateUntil);
      return eventDateUntil > currentDate;
    });
  } catch (error) {
    return handleError("Error fetching events", "events_fetch-error", 500);
  }
}

export async function getUpcomingEvents() {
  const currentDate = new Date();

  const data = await databases.listDocuments("hp_db", "events", [
    Query.orderAsc("date"),
    Query.greaterThanEqual("date", currentDate.toISOString()),
  ]);

  return data.documents.filter((event) => {
    const eventDateUntil = new Date(event.dateUntil);
    return eventDateUntil > currentDate;
  });
}

export async function getArchivedEvents() {
  const currentDate = new Date();

  const data = await databases.listDocuments("hp_db", "events", [
    Query.orderAsc("date"),
    Query.lessThan("dateUntil", currentDate.toISOString()),
  ]);

  return data.documents;
}
