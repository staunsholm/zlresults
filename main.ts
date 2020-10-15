import fetch from "node-fetch";
import * as _ from "lodash";
import { Category, Prime, Rider, Team } from "./types";
import { individualRiderScores } from "./constants";

async function getPrimes(eventId: string, category: string): Promise<Prime[]> {
  const res = await fetch(
    `https://www.zwiftpower.com:443/api3.php?do=event_primes&zid=${eventId}&category=${category}&prime_type=msec`
  );
  const { data }: { data: Prime[] } = await res.json();

  // 6 = Watopia KOM Forward
  // 9 = Valcano Climb
  // 38 = Titans Grove Forward
  const subset = data.filter(
    (prime) => [6, 9, 38].indexOf(prime.sprint_id) !== -1
  );
  return subset;
}

function getPrimesPoints(primes: Prime[], zwid: number): number {
  let primesPoints = 0;
  primes.forEach((prime: Prime) => {
    if (zwid === 2303648)
      console.log(
        prime.rider_1.zwid,
        prime.rider_2.zwid,
        prime.rider_3.zwid,
        prime.rider_4.zwid,
        prime.rider_5.zwid,
        zwid
      );
    primesPoints += prime.rider_1.zwid === zwid ? 5 : 0;
    primesPoints += prime.rider_2.zwid === zwid ? 4 : 0;
    primesPoints += prime.rider_3.zwid === zwid ? 3 : 0;
    primesPoints += prime.rider_4.zwid === zwid ? 2 : 0;
    primesPoints += prime.rider_5.zwid === zwid ? 1 : 0;
  });
  return primesPoints;
}

async function getRiders(
  eventId: string,
  category: Category,
  primes: Prime[]
): Promise<Rider[]> {
  const res = await fetch(
    `https://www.zwiftpower.com:443/cache3/results/${eventId}_view.json`
  );
  const { data }: { data: Rider[] } = await res.json();

  data.forEach((rider) => {
    const { name } = rider;
    rider.zlteam = name.substring(
      name.lastIndexOf("(") + 1,
      name.lastIndexOf(")")
    );
    const pos = rider.position_in_cat;
    rider.zlscore = pos < 30 ? individualRiderScores[pos - 1] : 1;
    rider.zlprimespoints = getPrimesPoints(primes, rider.zwid);
  });

  const riders = data.filter(
    (rider) => rider.category === category && rider.zlteam
  );
  return riders;
}

function getTeams(riders: Rider[]): Team[] {
  function calcPoints(zlteam: string): number {
    let points = 0;
    riders.forEach((item) => {
      if (item.zlteam === zlteam) {
        points += item.zlscore;
      }
    });
    return points;
  }

  const uniqByZLTeam = _.uniqBy(riders, "zlteam");

  const teams: Team[] = uniqByZLTeam.map(
    (team): Team => {
      const individualpoints = calcPoints(team.zlteam);
      const primespoints = riders
        .filter((rider) => rider.zlteam === team.zlteam)
        .reduce((prev, rider) => prev + rider.zlprimespoints, 0);

      return {
        zlteam: team.zlteam,
        individualpoints,
        primespoints,
        teampoints: 0,
        points: individualpoints + primespoints,
      };
    }
  );

  const sortedTeams: Team[] = _.orderBy(teams, "points", "desc");

  sortedTeams.forEach((team, index) => {
    team.teampoints = index < 20 ? 20 - index : 0;
    team.points += team.teampoints;
  });

  return sortedTeams;
}

export function toHtml(teams: Team[]): string {
  const lines = teams.map(
    (team, index) => `<tr>
        <td>${index + 1}.</td>
        <td>${team.zlteam}</td>
        <td>${team.individualpoints}</td>
        <td>${team.primespoints}</td>
        <td>${team.teampoints}</td>
        <td>${team.points}</td>
    </tr>`
  );
  const header =
    "<tr><th>Position</th><th>Name</th><th>Individual</th><th>Primes</th><th>Team</th><th>Total</th></tr>";
  const table = `<table>${header}${lines.join("")}</table>`;
  return `<html lang="en"><head><title>Zwift League</title></head><body>${table}</body></html>`;
}

export async function getTeamResults(
  eventId: string,
  category: Category
): Promise<Team[]> {
  const primes = await getPrimes(eventId, category);
  const riders = await getRiders(eventId, category, primes);
  const teams = getTeams(riders);

  return teams;
}
