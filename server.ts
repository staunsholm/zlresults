import * as express from "express";
import {getTeamResults, toHtml} from "./main";
import { Category } from "./types";

const app = express();
const PORT: string | number = process.env.PORT || 5000;

// const eventId: string = '1121811'; // EMEA W (MEN) - Pool 2
// const eventId: string = '1128517'; // EMEA E (MEN) - Pool 6

app.use("/teamresults/json", (req, res) => {
  const eventId = req.query.eventId as string;
  const category = req.query.category as Category;

  if (!eventId || !category) {
    res.end("example params: ?eventId=1121811&category=B");
    return;
  }

  getTeamResults(eventId, category).then((result) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  });
});

app.use("/teamresults/html", (req, res) => {
  const eventId = req.query.eventId as string;
  const category = req.query.category as Category;

  if (!eventId || !category) {
    res.end("example params: ?eventId=1121811&category=B");
    return;
  }

  getTeamResults(eventId, category).then((result) => {
    res.end(toHtml(result));
  });
});

app.listen(PORT, () => console.log(`hosting @${PORT}`));
