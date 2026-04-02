export interface Constituency {
  CONST_ID: number;
  CONSTITUENCY: string;
  DISTRICT: string;
  LOK_SABHA_CONSTITUENCY: string;
  HINDU_PCT: number;
  MUSLIM_PCT: number;
  CHRISTIAN_PCT: number;
  SC_PCT: number;
  ST_PCT: number;
}

export type Alliance = 'UDF' | 'LDF' | 'NDA' | 'IND';

export interface AssemblyElection {
  CONST_ID: number;
  CONSTITUENCY: string;
  YEAR: number;
  UDF_CANDIDATE: string;
  UDF_PARTY: string;
  UDF_VOTES: number;
  UDF_VOTE_PCT: number;
  LDF_CANDIDATE: string;
  LDF_PARTY: string;
  LDF_VOTES: number;
  LDF_VOTE_PCT: number;
  NDA_CANDIDATE: string;
  NDA_PARTY: string;
  NDA_VOTES: number;
  NDA_VOTE_PCT: number;
  TOTAL_VALID_VOTES: number;
  WINNER: string;
  WINNING_PARTY: string;
  WINNING_ALLIANCE: Alliance;
  MARGIN: number;
  MARGIN_PCT: number;
  TOTAL_ELECTORS: number;
  TOTAL_POLLED: number;
  POLLING_PCT: number;
  UDF_SWING?: number;
  LDF_SWING?: number;
  NDA_SWING?: number;
}

export interface LokSabhaElection {
  CONST_ID: number;
  CONSTITUENCY: string;
  YEAR: number;
  UDF_CANDIDATE: string;
  UDF_VOTES: number;
  UDF_VOTE_PCT: number;
  LDF_CANDIDATE: string;
  LDF_VOTES: number;
  LDF_VOTE_PCT: number;
  NDA_CANDIDATE: string;
  NDA_VOTES: number;
  NDA_VOTE_PCT: number;
  TOTAL_VALID_VOTES: number;
  WINNING_ALLIANCE: Alliance;
  MARGIN: number;
  NOTA?: number;
  UDF_SWING?: number;
  LDF_SWING?: number;
  NDA_SWING?: number;
}

export interface CategoryAnalysis {
  CONST_ID: number;
  CONSTITUENCY: string;
  WIN_A2011: string;
  MARGIN_A2011: number;
  UDF_PCT_A2011: number;
  LDF_PCT_A2011: number;
  NDA_PCT_A2011: number;
  WIN_A2016: string;
  MARGIN_A2016: number;
  UDF_PCT_A2016: number;
  LDF_PCT_A2016: number;
  NDA_PCT_A2016: number;
  WIN_A2021: string;
  MARGIN_A2021: number;
  UDF_PCT_A2021: number;
  LDF_PCT_A2021: number;
  NDA_PCT_A2021: number;
  WIN_LS2014: string;
  MARGIN_LS2014: number;
  UDF_PCT_LS2014: number;
  LDF_PCT_LS2014: number;
  NDA_PCT_LS2014: number;
  WIN_LS2019: string;
  MARGIN_LS2019: number;
  UDF_PCT_LS2019: number;
  LDF_PCT_LS2019: number;
  NDA_PCT_LS2019: number;
  WIN_LS2024: string;
  MARGIN_LS2024: number;
  UDF_PCT_LS2024: number;
  LDF_PCT_LS2024: number;
  NDA_PCT_LS2024: number;
  UDF_WINS: number;
  LDF_WINS: number;
  NDA_WINS: number;
  CATEGORY: string;
}
