import { databases, databasesAdmin } from "../main.js";
import { ID, Permission, Query, Role } from "node-appwrite";
import { checkAuthentication, handleResponse } from "./errorHandler.js";

export async function getEvent(query: { eventId: string }, error: any) {
  try {
    const event = await databases.getDocument("hp_db", "events", query.eventId);
    const attendees = await databasesAdmin.listDocuments(
      "hp_db",
      "events-attendees",
      [Query.equal("eventId", query.eventId), Query.limit(50000000)],
    );
    return { ...event, attendees: attendees.total };
  } catch (e) {
    error("Error fetching event", e);
    return handleResponse("Error fetching event", "event_fetch_error", 500);
  }
}

export async function getEventAttendees(
  query: { eventId: string },
  error: any,
  userId?: string,
) {
  try {
    const eventAttendees = await databasesAdmin.listDocuments(
      "hp_db",
      "events-attendees",
      [Query.equal("eventId", query.eventId), Query.limit(500000)],
    );

    let userAttending = false;
    if (userId) {
      userAttending = eventAttendees.documents.some(
        (attendee) => attendee.userId === userId,
      );
    }

    return { attendees: eventAttendees.total, isAttending: userAttending };
  } catch (e) {
    error("Error fetching event attendees", e);
    return handleResponse("Error fetching event", "event_fetch_error", 500);
  }
}

export async function getNextEvent(error: any) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("date", currentDate.toISOString()),
      Query.limit(1),
    ]);

    if (data.documents.length === 0) {
      return data.documents;
    }

    const nextEvent = data.documents.filter((event) => {
      const eventDateUntil = new Date(event.dateUntil);
      return eventDateUntil > currentDate;
    })[0];

    if (nextEvent) {
      const attendees = await getEventAttendees(
        { eventId: nextEvent.$id },
        error,
      );
      return { ...nextEvent, attendees: attendees };
    }

    return nextEvent;
  } catch (e) {
    return handleResponse(
      "Error fetching next events",
      "events_next_fetch-error",
      500,
    );
  }
}

export async function getEvents(
  query: { offset: number; limit: number },
  error: any,
) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("dateUntil", currentDate.toISOString()),
      Query.lessThanEqual("date", currentDate.toISOString()),
      Query.limit(query.limit || 20),
      Query.offset(query.offset || 0),
    ]);

    const eventsWithAttendees = await Promise.all(
      data.documents.map(async (event) => {
        const attendees = await getEventAttendees(
          { eventId: event.$id },
          error,
        );
        return { ...event, attendees: attendees || 0 };
      }),
    );

    return eventsWithAttendees.filter((event) => {
      const eventDateUntil = new Date(event["dateUntil"]);
      return eventDateUntil > currentDate;
    });
  } catch (e) {
    error("Error fetching events", e);
    return handleResponse("Error fetching events", "events_fetch_error", 500);
  }
}

export async function getUpcomingEvents(
  query: { offset: number; limit: number },
  error: any,
) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.greaterThanEqual("date", currentDate.toISOString()),
      Query.limit(query.limit || 20),
      Query.offset(query.offset || 0),
    ]);

    const eventsWithAttendees = await Promise.all(
      data.documents.map(async (event) => {
        const attendees = await getEventAttendees(
          { eventId: event.$id },
          error,
        );
        return { ...event, attendees: attendees || 0 };
      }),
    );

    return eventsWithAttendees.filter((event) => {
      const eventDateUntil = new Date(event["dateUntil"]);
      return eventDateUntil > currentDate;
    });
  } catch (e) {
    error("Error fetching upcoming events", e);
    return handleResponse(
      "Error fetching upcoming events",
      "events_upcoming_fetch_error",
      500,
    );
  }
}

export async function getArchivedEvents(
  query: { offset: number; limit: number },
  error: any,
) {
  const currentDate = new Date();

  try {
    const data = await databases.listDocuments("hp_db", "events", [
      Query.orderAsc("date"),
      Query.lessThan("dateUntil", currentDate.toISOString()),
      Query.limit(query.limit || 20),
      Query.offset(query.offset || 0),
    ]);

    return await Promise.all(
      data.documents.map(async (event) => {
        const attendees = await getEventAttendees(
          { eventId: event.$id },
          error,
        );
        return { ...event, attendees: attendees || 0 };
      }),
    );
  } catch (e) {
    error("Error fetching archived events", e);
    return handleResponse(
      "Error fetching archived events",
      "events_archived_fetch_error",
      500,
    );
  }
}

export async function postEventAttendee(
  userId: string,
  query: { eventId: string },
  error: any,
) {
  await checkAuthentication(userId);

  try {
    await databasesAdmin.createDocument(
      "hp_db",
      "events-attendees",
      ID.unique(),
      {
        eventId: query.eventId,
        userId: userId,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    );
    return handleResponse("Attendee added", "event_attendee_add_success", 200);
  } catch (e) {
    if (e.type === "document_already_exists") {
      return handleResponse(
        "Attendee already added",
        "event_attendee_add_already_added",
        400,
      );
    }
    error("Error adding attendee", e);
    return handleResponse(
      e.message || "Error adding attendee",
      e.type || "event_attendee_add_error",
      e.code || 500,
    );
  }
}

export async function deleteEventAttendee(
  userId: string,
  query: { eventId: string },
  error: any,
) {
  await checkAuthentication(userId);

  try {
    const data = await databases.listDocuments("hp_db", "events-attendees", [
      Query.equal("eventId", query.eventId),
      Query.equal("userId", userId),
      Query.limit(1),
    ]);

    if (data.documents.length === 0) {
      return handleResponse(
        "Attendee not found",
        "event_attendee_remove_not_found",
        404,
      );
    }

    await databasesAdmin.deleteDocument(
      "hp_db",
      "events-attendees",
      data.documents[0].$id,
    );

    return handleResponse(
      "Attendee removed",
      "event_attendee_remove_success",
      200,
    );
  } catch (e) {
    error("Error removing attendee", e);
    return handleResponse(
      e.message || "Error removing attendee",
      e.type || "event_attendee_remove_error",
      e.code || 500,
    );
  }
}
