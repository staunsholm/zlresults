import { ZwiftEvent } from "../../types";

export async function getEvents(round: number) {
  const response = await fetch(`/events?round=${round}`);
  const json = await response.json();
  return json;
}

export async function getEventTeamResult(event: ZwiftEvent) {
  const response = await fetch(
    `/teamresults/json?eventId=${event.eventId}&category=B`
  );
  const json = await response.json();
  return json;
}
