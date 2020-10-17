import { ZwiftEvent } from "../../types";

export async function getEvents(round: number) {
  const response = await fetch(`http://localhost:5000/events?round=${round}`);
  const json = await response.json();
  return json;
}

export async function getEventTeamResult(event: ZwiftEvent) {
  const response = await fetch(
    `http://localhost:5000/teamresults/json?eventId=${event.eventId}&category=B`
  );
  const json = await response.json();
  return json;
}
