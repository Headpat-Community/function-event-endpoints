import {databases, databasesAdmin} from "../main.js";
import {ID, Permission, Query, Role} from "node-appwrite";
import {checkAuthentication, handleResponse} from "./errorHandler.js";

export async function getEvent(query: { eventId: string }, error: any) {
  try {
    const event = await databases.getDocument("hp_db", "events", query.eventId);
    const attendees = await databasesAdmin.listDocuments("hp_db", "events-attendees", [
      Query.equal("eventId", query.eventId),
      Query.limit(50000000)
    ]);
    return { ...event, attendees: attendees.total };
  } catch (e) {
    error("Error fetching event", e);
    return handleResponse("Error fetching event", "event-fetch-error", 500);
  }
}

export async function getEventAttendees(query: { eventId: string }, error: any) {
  try {
    const attendees = await databasesAdmin.listDocuments("hp_db", "events-attendees", [
      Query.equal("eventId", query.eventId),
      Query.limit(50000000)
    ]);
    return attendees.total;
  } catch (e) {
    error("Error fetching event attendees", e);
    return handleResponse("Error fetching event", "event-fetch-error", 500);
  }
}

export async function getNextEvent(error: any) {
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
  } catch (e) {
    return handleResponse(
      "Error fetching next events",
      "events_next_fetch-error",
      500,
    );
  }
}

export async function getEvents(query: { offset: number, limit: number }, error: any) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("dateUntil", currentDate.toISOString()),
      Query.lessThanEqual("date", currentDate.toISOString()),
      Query.limit(query.limit || 20),
      Query.offset(query.offset || 0),
    ]);

    const eventsWithAttendees = await Promise.all(data.documents.map(async (event) => {
      const attendees = await getEventAttendees({ eventId: event.$id }, error);
      return { ...event, attendees: attendees };
    }));

    return eventsWithAttendees.filter((event) => {
      const eventDateUntil = new Date(event['dateUntil']);
      return eventDateUntil > currentDate;
    });
  } catch (e) {
    error("Error fetching events", e);
    return handleResponse("Error fetching events", "events_fetch-error", 500);
  }
}

export async function getUpcomingEvents(error: any) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("date", currentDate.toISOString()),
    ]);

    return data.documents.filter((event) => {
      const eventDateUntil = new Date(event.dateUntil);
      return eventDateUntil > currentDate;
    });
  } catch (e) {
    error("Error fetching upcoming events", e);
    return handleResponse("Error fetching upcoming events", "events_upcoming_fetch-error", 500);
  }
}

export async function getArchivedEvents(error: any) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.lessThan("dateUntil", currentDate.toISOString()),
    ]);

    return data.documents;
  } catch (e) {
    error("Error fetching archived events", e);
    return handleResponse("Error fetching archived events", "events_archived_fetch-error", 500);
  }
}

export async function postEventAttendee(userId: string, query: { eventId: string }, error: any) {
  await checkAuthentication(userId);

  try {
    await databasesAdmin.createDocument("hp_db", "events-attendees", ID.unique(), {
      eventId: query.eventId,
      userId: userId,
    }, [
      Permission.read(Role.user(userId)),
      Permission.delete(Role.user(userId))
    ]);
    return handleResponse("Attendee added", "event-attendee-add-success", 200);
  } catch (e) {
    error("Error adding attendee", e);
    return handleResponse("Error adding attendee", "event-attendee-add-error", 500);
  }
}
