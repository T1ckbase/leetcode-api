// deno-lint-ignore-file no-explicit-any
import type { Lang } from './lang.ts';

export interface CodeWithRuntime {
  code: string;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type SubmissionState = 'PENDING' | 'STARTED' | 'SUCCESS';

export type PendingSubmission = {
  state: 'PENDING' | 'STARTED';
};

export type SuccessSubmission = {
  state: 'SUCCESS';
} & SubmissionResult;

export type SubmissionCheckResult = PendingSubmission | SuccessSubmission;

export interface SubmissionResult {
  status_code: number;
  lang: string;
  run_success: boolean;
  status_runtime: string;
  memory: number;
  display_runtime: string;
  question_id: string;
  elapsed_time: number;
  compare_result: string;
  code_output: string;
  std_output: string;
  last_testcase: string;
  expected_output: string;
  task_finish_time: number;
  task_name: string;
  finished: boolean;
  total_correct: number;
  total_testcases: number;
  runtime_percentile: number;
  status_memory: string;
  memory_percentile: number;
  pretty_lang: string;
  submission_id: string;
  status_msg: string;
  state: string;
}

export interface SubmissionDetails {
  runtime: number;
  runtimeDisplay: string;
  runtimePercentile: number;
  runtimeDistribution: string;
  memory: number;
  memoryDisplay: string;
  memoryPercentile: number;
  memoryDistribution: string;
  code: string;
  timestamp: number;
  statusCode: number;
  user: {
    username: string;
    profile: {
      realName: string;
      userAvatar: string;
    };
  };
  lang: {
    name: Lang;
    verboseName: string;
  };
  question: {
    questionId: string;
    titleSlug: string;
    hasFrontendPreview: boolean;
  };
  notes: string;
  flagType: string;
  topicTags: any[];
  runtimeError: any;
  compileError: any;
  lastTestcase: string;
  codeOutput: string;
  expectedOutput: string;
  totalCorrect: number;
  totalTestcases: number;
  fullCodeOutput: any;
  testDescriptions: any;
  testBodies: any;
  testInfo: any;
  stdOutput: string;
}
