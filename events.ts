import fetch from "node-fetch";
import { ZwiftEvent } from "./types";

function isInRound(event: any, round: number): boolean {
  const eventRound =
    Math.round(
      (event.tm * 1000 - new Date(2020, 9, 12).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    ) + 1;
  return eventRound === round;
}

export async function getEvents(round: number): Promise<ZwiftEvent[]> {
  const result = await fetch(
    "https://www.zwiftpower.com/api3.php?do=series_event_list&id=WTRL"
  );
  const { data } = await result.json();

  const events = data
    .filter((event) => event.t.startsWith("Zwift Racing League"))
    .filter((event) => isInRound(event, round))
    .map((event) => ({
      name: event.t,
      eventId: event.zid,
      time: new Date(event.tm * 1000).toISOString(),
      length: event.km,
      categories: event.cats,
      route: event.f_r,
    }));

  return events;
}
