import fetch from "node-fetch";
import * as _ from "lodash";
import { Category, LiveRider, Prime, Rider, Team } from "./types";
import { individualRiderScores } from "./constants";

async function getLiveRiders(eventId): Promise<LiveRider[]> {
  const res = await fetch(
    `https://www.zwiftpower.com/cache3/live/results_${eventId}.json`
  );
  const { data }: { data: LiveRider[] } = await res.json();

  return data;
}

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

  if (!res.ok) {
    return [];
  }

  // get name from live feed (as it will have the correct team name in it)
  const liveRiders = await getLiveRiders(eventId);

  const { data }: { data: Rider[] } = await res.json();

  data.forEach((rider) => {
    const liveRider = _.find(liveRiders, { zwid: rider.zwid });
    if (!liveRider) {
      return;
    }

    const { name } = liveRider;
    rider.name = name;
    rider.zlteam = name
      .substring(name.lastIndexOf("(") + 1, name.lastIndexOf(")"))
      .trim();
    rider.zlteamnormalized = rider.zlteam.toLowerCase();

    const pos = rider.position_in_cat;
    rider.zlscore = pos < 30 ? individualRiderScores[pos - 1] : 1;

    rider.zlprimespoints = getPrimesPoints(primes, rider.zwid);
  });

  const riders = data.filter(
    (rider) => rider.category === category && rider.zlteamnormalized
  );
  return riders;
}

function getTeams(riders: Rider[]): Team[] {
  function calcPoints(zlteamnormalized: string): number {
    let points = 0;
    riders.forEach((item) => {
      if (item.zlteamnormalized === zlteamnormalized) {
        points += item.zlscore;
      }
    });
    return points;
  }

  const uniqByTeam = _.uniqBy(riders, "zlteamnormalized");

  const teams: Team[] = uniqByTeam.map(
    (team): Team => {
      const individualpoints = calcPoints(team.zlteamnormalized);
      const primespoints = riders
        .filter((rider) => rider.zlteamnormalized === team.zlteamnormalized)
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
  });

  return sortedTeams;
}

export async function getTeamResults(
  eventIds: string[],
  category: Category
): Promise<Team[]> {
  const riders: Rider[] = [];

  for (const eventId of eventIds) {
    const primes = await getPrimes(eventId, category);
    riders.push(...(await getRiders(eventId, category, primes)));
  }

  const teams = getTeams(riders);

  return teams;
}
