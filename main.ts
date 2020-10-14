import request from 'then-request';
import * as _ from 'lodash';

//const eventId: string = '1121811'; // EMEA W (MEN) - Pool 2
const eventId: string = '1128517'; // EMEA E (MEN) - Pool 6

type Rider = {
    "DT_RowId": string,
    "ftp": string,
    "friend": 0 | 1,
    "pt": string,
    "label": string,
    "zid": string,
    "pos": number,
    "position_in_cat": number,
    "name": string,
    "cp": number,
    "zwid": number,
    "res_id": string,
    "lag": number,
    "uid": string,
    "time": number[],
    "time_gun": number,
    "gap": number,
    "vtta": string,
    "vttat": 0 | 1,
    "male": 0 | 1,
    "tid": string,
    "topen": string,
    "tname": string,
    "tc": string,
    "tbc": string,
    "tbd": string,
    "zeff": number,
    "category": 'A' | 'B' | 'C' | 'D' | 'E',
    "zlteam"?: string;
    "zlscore"?: number;
    "zlprimespoints"?: number;
};

type Prime = {
    lap: number;
    name: string;
    id: number;
    sprint_id: number;
    rider_1: Rider;
    rider_2: Rider;
    rider_3: Rider;
    rider_4: Rider;
    rider_5: Rider;
};

type Team = {
    zlteam: string;
    points: number;
    individualpoints: number;
    primespoints: number;
};

const individualRiderScores = [
    40, 35, 30, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2
];

async function getPrimes(): Promise<Prime[]> {
    const res = await request('GET', `https://www.zwiftpower.com/api3.php?do=event_primes&zid=${eventId}&category=B&prime_type=msec`);
    const {data}: { data: Prime[] } = JSON.parse(res.getBody('utf8'));

    // 6 = Watopia KOM Forward
    // 9 = Valcano Climb
    // 38 = Titans Grove Forward
    const subset = data.filter((prime) => [6, 9, 38].indexOf(prime.sprint_id) === -1);

    return subset;
}

function getPrimesPoints(primes: Prime[], zwid: number): number {
    let primesPoints = 0;
    primes.forEach((prime: Prime) => {
        primesPoints += prime.rider_1.zwid === zwid ? 5 : 0
        primesPoints += prime.rider_2.zwid === zwid ? 4 : 0
        primesPoints += prime.rider_3.zwid === zwid ? 3 : 0
        primesPoints += prime.rider_4.zwid === zwid ? 2 : 0
        primesPoints += prime.rider_5.zwid === zwid ? 1 : 0
    })
    return primesPoints;
}

async function getRiders(primes: Prime[]): Promise<Rider[]> {
    const res = await request('GET', `https://www.zwiftpower.com/cache3/results/${eventId}_view.json?_=1602662575501`)
    const {data}: { data: Rider[] } = JSON.parse(res.getBody('utf8'));

    data.forEach((rider) => {
        const {name} = rider;
        rider.zlteam = name.substring(name.lastIndexOf('(') + 1, name.lastIndexOf(')'));
        const pos = rider.position_in_cat;
        rider.zlscore = pos < 30 ? individualRiderScores[pos - 1] : 1;
        rider.zlprimespoints = getPrimesPoints(primes, rider.zwid);
    });

    const riders = data.filter((rider) => rider.category === 'B' && rider.zlteam);

    return riders;
}

async function getTeams(riders: Rider[]): Promise<Team[]> {
    function calcPoints(zlteam: string): number {
        let points = 0;
        riders.forEach((item) => {
            if (item.zlteam === zlteam) {
                points += item.zlscore;
            }
        });
        return points;
    }

    const uniqByZLTeam = _.uniqBy(riders, 'zlteam');

    const teams: Team[] = uniqByZLTeam.map((team): Team => {
        const individualpoints = calcPoints(team.zlteam);
        const primespoints = riders
            .filter((rider) => rider.zlteam === team.zlteam)
            .reduce((prev, rider) => prev + rider.zlprimespoints, 0);

        return ({
            zlteam: team.zlteam,
            individualpoints,
            primespoints,
            points: individualpoints + primespoints,
        });
    });

    const sortedTeams: Team[] = _.orderBy(teams, 'points', 'desc');

    return sortedTeams;
}

function toHtml(teams: Team[]): string {
    const lines = teams.map((team) => `<tr>
        <td>${team.zlteam}</td>
        <td>${team.individualpoints}</td>
        <td>${team.primespoints}</td>
        <td>${team.points}</td>
    </tr>`);
    const table = `<table><tr><th>Name</th><th>Individual</th><th>Primes</th><th>Total</th></tr>${lines.join('')}</table>`;
    return `<html><head><title>Zwift League</title><body>${table}</body></head>`;
}

async function go() {
    const primes = await getPrimes();
    const riders = await getRiders(primes);
    const teams = await getTeams(riders);

    console.log(toHtml(teams));
}

go();
