// deno-lint-ignore-file no-explicit-any

export interface ActiveDailyCodingChallengeQuestion {
  date: string;
  userStatus: string;
  link: string;
  question: Question;
}

export interface Question {
  titleSlug: string;
  title: string;
  translatedTitle: any;
  acRate: number;
  difficulty: string;
  freqBar: any;
  frontendQuestionId: string;
  isFavor: boolean;
  paidOnly: boolean;
  status: any;
  hasVideoSolution: boolean;
  hasSolution: boolean;
  // Manually added questionId
  questionId: string;
  topicTags: TopicTag[];
}

export interface TopicTag {
  name: string;
  id: string;
  slug: string;
}
