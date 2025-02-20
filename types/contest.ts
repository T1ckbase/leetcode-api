// deno-lint-ignore-file no-explicit-any

export type ContestType = 'biweekly' | 'weekly';

export interface WeekendContest {
  contest: Contest;
  questions: ContestQuestion[];
  company: Company;
  containsPremium: boolean;
  registered: boolean;
  survey: any;
  current_timestamp: number;
  ranking_updated: boolean;
  unrated: boolean;
}

export interface Contest {
  id: number;
  title: string;
  title_slug: string;
  description: string;
  duration: number;
  start_time: number;
  is_virtual: boolean;
  origin_start_time: number;
  is_private: boolean;
  discuss_topic_id: number;
  card_img: any;
  primary_color: string;
  secondary_color: string;
  background_colors: string[];
}

export interface ContestQuestion {
  id: number;
  question_id: number;
  credit: number;
  title: string;
  title_slug: string;
  category_slug: string;
}

export interface Company {
  name: string;
  description: string;
  logo: any;
}

export interface ReportResult {
  date: number;
  username: string;
  submission: number;
  status: number;
  description: string;
  id: number;
  user: number;
  original_submission_id: number;
  reported_user: string;
  contest_title: string;
}

export interface TotalRank {
  contest_id: number;
  username: string;
  user_slug: string;
  country_code: string;
  country_name?: string;
  rank: number;
  score: number;
  finish_time: number;
  data_region: string;
  avatar_url: string;
  color: any;
  medal?: {
    icon: string;
    name: string;
  };
  up: boolean;
  replays: {
    [key: string]: boolean;
  };
  submissions: {
    [key: string]: {
      date: number;
      fail_count: number;
      lang: string;
      submission_id: number;
    };
  };
}

export interface WeekendContestRanking {
  user_num: number;
  ak_info: {
    ak_num: number;
    lastest_ak_avatars: string[];
  };
  total_rank: TotalRank[];
}

export interface ContestSubmission {
  id: number;
  code: string;
  lang: string;
  contest_submission: number;
}
