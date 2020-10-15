export type Category = "A" | "B" | "C" | "D" | "E";

export type Rider = {
  DT_RowId: string;
  ftp: string;
  friend: 0 | 1;
  pt: string;
  label: string;
  zid: string;
  pos: number;
  position_in_cat: number;
  name: string;
  cp: number;
  zwid: number;
  res_id: string;
  lag: number;
  uid: string;
  time: number[];
  time_gun: number;
  gap: number;
  vtta: string;
  vttat: 0 | 1;
  male: 0 | 1;
  tid: string;
  topen: string;
  tname: string;
  tc: string;
  tbc: string;
  tbd: string;
  zeff: number;
  category: Category;
  zlteam?: string;
  zlscore?: number;
  zlprimespoints?: number;
};

export type Prime = {
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

export type Team = {
  zlteam: string;
  points: number;
  individualpoints: number;
  primespoints: number;
};
