import { ZwiftEvent } from "../../types";

const isDev = process.env.NODE_ENV === 'development';
const prefix = isDev ? 'http://localhost:5000' : '';

export async function getEvents(round: number) {

  const response = await fetch(`${prefix}/events?round=${round}`);
  const json = await response.json();
  return json;
}

export async function getEventTeamResult(event: ZwiftEvent) {
  const response = await fetch(
    `${prefix}/teamresults/json?eventId=${event.eventId}&category=B`
  );
  const json = await response.json();
  return json;
}
