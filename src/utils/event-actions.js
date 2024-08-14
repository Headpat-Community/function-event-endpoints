import { databases } from "../main.js";

export async function getEvents() {
  return await databases.listDocuments("hp_db", "events");
}
