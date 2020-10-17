import * as express from "express";
import { getTeamResults } from "./teamResults";
import { Category } from "./types";
import { getEvents } from "./events";

const app = express();
const PORT: string | number = process.env.PORT || 5000;

app.use("/teamresults/json", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  const eventId = req.query.eventId as string;
  const category = req.query.category as Category;

  const eventIds = eventId.split(",");

  if (!eventId || !category) {
    res.end("example params: ?eventId=1121811&category=B");
    return;
  }

  getTeamResults(eventIds, category).then((result) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  });
});

app.use("/events", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  const round = parseInt(req.query.round as string, 10);

  res.end(JSON.stringify(await getEvents(round)));
});

app.use(express.static("public/build"));

app.listen(PORT, () => console.log(`hosting @${PORT}`));
