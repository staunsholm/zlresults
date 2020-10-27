import { ZwiftEvent } from "../../types";

const isDev = process.env.NODE_ENV === "development";
const prefix = isDev ? "http://localhost:5000" : "";

export async function getEvents(round: number) {
  const response = await fetch(`${prefix}/events?round=${round}`);
  return await response.json();
}

export async function getEventTeamResult(event: ZwiftEvent) {
  const response = await fetch(
    `${prefix}/teamresults/json?eventId=${event.eventId}&category=B`
  );
  return await response.json();
}
