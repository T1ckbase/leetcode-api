import { delay } from '@std/async/delay';
import type { Cookie } from '@std/http/cookie';
import { CookieFetcher, type FetcherConfig } from './utils/cookie-fetcher.ts';
import type {
  ActiveDailyCodingChallengeQuestion,
  CodeWithRuntime,
  ContestSubmission,
  ContestType,
  Lang,
  Question,
  ReportResult,
  SubmissionCheckResult,
  SubmissionDetails,
  SubmissionResult,
  UserStatus,
  WeekendContest,
  WeekendContestRanking,
} from './types/types.ts';

/**
 * Leetcode API
 *
 * ```ts
 * const leetcode = new Leetcode({
 *   headers: {
 *     'User-Agent': 'Mozilla/5.0 ...',
 *   },
 *   cookieFile: 'cookies.json',
 * });
 *
 * // or
 *
 * const leetcode = new Leetcode({
 *   headers: {
 *     'User-Agent': 'Mozilla/5.0 ...',
 *   },
 *   cookies: 'csrftoken=...',
 * });
 *
 * // or
 *
 * const leetcode = new Leetcode({
 *   headers: {
 *     'User-Agent': 'Mozilla/5.0 ...',
 *   },
 *   cookies: [
 *     { name: 'csrftoken', value: '...' },
 *     { name: 'ip_check', value: '...' },
 *   ],
 * });
 * ```
 */
export class Leetcode {
  private baseUrl = 'https://leetcode.com';
  private fetcher: CookieFetcher;
  private keepAliveInterval?: number;

  constructor(config?: Partial<FetcherConfig>) {
    this.fetcher = new CookieFetcher({
      baseUrl: this.baseUrl,
      ...config,
      headers: {
        'Origin': this.baseUrl,
        'Referer': `${this.baseUrl}/`,
        ...config?.headers,
      },
    });

    this.startKeepAlive();
  }

  startKeepAlive(): void {
    // Clear any existing interval
    this.stopKeepAlive();

    // Start new interval (5 minutes = 300000 milliseconds)
    this.keepAliveInterval = setInterval(() => {
      this.pingGraphQL().catch((error) => {
        console.error('Error in keep-alive ping:', error);
      });
    }, 300000);

    // Do initial ping
    this.pingGraphQL().catch((error) => {
      console.error('Error in initial keep-alive ping:', error);
    });
  }

  stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = undefined;
    }
  }

  async getUserStatus(): Promise<UserStatus> {
    const response = await this.fetcher.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query globalData {
            userStatus {
              userId
              isSignedIn
              isMockUser
              isPremium
              isVerified
              username
              realName
              avatar
              isAdmin
              isSuperuser
              permissions
              isTranslator
              activeSessionId
              checkedInToday
              completedFeatureGuides
              notificationStatus {
                lastModified
                numUnread
              }
            }
          }
        `,
        variables: {},
        operationName: 'globalData',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get user status: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).data.userStatus;
  }

  async checkIn(): Promise<boolean> {
    const csrftoken = this.fetcher.getCookie('csrftoken');
    if (!csrftoken) {
      throw new Error('No CSRF token found');
    }

    const response = await this.fetcher.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrftoken.value,
      },
      body: JSON.stringify({
        query: `
          mutation checkin {
            checkin {
              checkedIn
              ok
              error
              __typename
            }
          }
        `,
        variables: {},
        operationName: 'checkin',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check in: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).data.checkin?.ok ?? false;
  }

  async collectContestEasterEgg(): Promise<boolean> {
    const csrftoken = this.fetcher.getCookie('csrftoken');
    if (!csrftoken) {
      throw new Error('No CSRF token found');
    }

    const response = await this.fetcher.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrftoken.value,
      },
      body: JSON.stringify({
        query: `
          mutation collectContestEasterEgg {
            collectContestEasterEgg {
              ok
            }
          }
        `,
        variables: {},
        operationName: 'collectContestEasterEgg',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to collect contest easter egg: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).data.collectContestEasterEgg.ok;
  }

  async getActiveDailyCodingChallengeQuestion(): Promise<ActiveDailyCodingChallengeQuestion> {
    const response = await this.fetcher.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Manually added questionId
        query: `
          query questionOfToday {
            activeDailyCodingChallengeQuestion {
              date
              userStatus
              link
              question {
                titleSlug
                title
                translatedTitle
                acRate
                difficulty
                freqBar
                frontendQuestionId: questionFrontendId
                isFavor
                paidOnly: isPaidOnly
                status
                hasVideoSolution
                hasSolution
                questionId
                topicTags {
                  name
                  id
                  slug
                }
              }
            }
          }
        `,
        variables: {},
        operationName: 'questionOfToday',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active daily coding challenge question: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).data.activeDailyCodingChallengeQuestion;
  }

  /**
   * Get the code with runtime for a given question and language
   * @param questionId - The ID of the question
   * @param lang - The language to get the code in
   * @param skip - unknown
   * @param maxRuntime - The maximum runtime to search for
   * @returns The code with runtime
   */
  async getCodeWithRuntime(questionId: number | string, lang: Lang, skip = 0, maxRuntime = 2000): Promise<CodeWithRuntime> {
    let runtime = 0;

    while (runtime <= maxRuntime) {
      // console.log(runtime);
      const response = await this.fetcher.fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query codeWithRuntime($questionId: Int!, $lang: String!, $runtime: Int!, $skip: Int!) {
              codeWithRuntime(
                questionId: $questionId
                lang: $lang
                runtime: $runtime
                skip: $skip
              ) {
                code
                hasPrevious
                hasNext
              }
            }
          `,
          variables: {
            questionId: Number(questionId),
            lang,
            skip,
            runtime,
          },
          operationName: 'codeWithRuntime',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch code: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Check for errors
      if (result.errors) {
        // If no submission found, try next runtime
        if (result.errors[0]?.message === 'No submission code for passed time/lang.') {
          runtime++;
          continue;
        }
        // For other errors, throw
        throw new Error(result.errors[0]?.message || 'Unknown GraphQL error');
      }

      if (!result.data.codeWithRuntime) {
        runtime++;
        continue;
      }

      // If we got valid data, return it
      if (result.data.codeWithRuntime) {
        return result.data.codeWithRuntime;
      }

      // If we get here, something unexpected happened
      throw new Error('Invalid response format');
    }

    // If runtime exceeds maxRuntime, throw an error
    throw new Error(`Exceeded maximum runtime of ${maxRuntime}ms without finding a submission.`);
  }

  async submitCode(question: Question, lang: Lang, code: string, timeLimit: number = 30000): Promise<SubmissionResult> {
    const csrftoken = this.fetcher.getCookie('csrftoken');
    if (!csrftoken) {
      throw new Error('No CSRF token found');
    }

    const response = await this.fetcher.fetch(`/problems/${question.titleSlug}/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': `${this.baseUrl}/problems/${question.titleSlug}/`,
        'x-csrftoken': csrftoken.value,
      },
      body: JSON.stringify({
        lang,
        question_id: question.questionId,
        typed_code: code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit code: ${response.status} ${response.statusText}`);
    }

    const { submission_id: submissionId } = await response.json() as { submission_id: number };

    // Poll submission status every second until it's complete
    while (timeLimit > 0) {
      const result = await this.checkSubmission(submissionId.toString());

      if (result.state === 'SUCCESS') {
        return result;
      } else if (result.state === 'PENDING' || result.state === 'STARTED') {
        // Wait 1 second before checking again
        await delay(1000);
        timeLimit -= 1000;
      } else {
        throw new Error(`Submission failed with state: ${result.state}`);
      }
    }

    throw new Error('Submission timed out');
  }

  async checkSubmission(submissionId: string): Promise<SubmissionCheckResult> {
    const response = await this.fetcher.fetch(`/submissions/detail/${submissionId}/check/`);
    if (!response.ok) {
      throw new Error(`Failed to check submission: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async getSubmissionDetails(submissionId: string): Promise<SubmissionDetails> {
    const response = await this.fetcher.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query submissionDetails($submissionId: Int!) {
            submissionDetails(submissionId: $submissionId) {
              runtime
              runtimeDisplay
              runtimePercentile
              runtimeDistribution
              memory
              memoryDisplay
              memoryPercentile
              memoryDistribution
              code
              timestamp
              statusCode
              user {
                username
                profile {
                  realName
                  userAvatar
                }
              }
              lang {
                name
                verboseName
              }
              question {
                questionId
                titleSlug
                hasFrontendPreview
              }
              notes
              flagType
              topicTags {
                tagId
                slug
                name
              }
              runtimeError
              compileError
              lastTestcase
              codeOutput
              expectedOutput
              totalCorrect
              totalTestcases
              fullCodeOutput
              testDescriptions
              testBodies
              testInfo
              stdOutput
            }
          }
        `,
        variables: { submissionId },
        operationName: 'submissionDetails',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get submission details: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).data.submissionDetails;
  }

  async getContest(type: ContestType, week: number): Promise<WeekendContest> {
    const csrftoken = this.fetcher.getCookie('csrftoken');
    if (!csrftoken) {
      throw new Error('No CSRF token found');
    }
    const response = await this.fetcher.fetch(`/contest/api/info/${type}-contest-${week}/`, {
      headers: {
        'x-csrftoken': csrftoken.value,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to get ${type} contest: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async getContestRanking(type: ContestType, week: number, page: number = 1): Promise<WeekendContestRanking> {
    const csrftoken = this.fetcher.getCookie('csrftoken');
    if (!csrftoken) {
      throw new Error('No CSRF token found');
    }
    const response = await this.fetcher.fetch(`/contest/api/ranking/${type}-contest-${week}/?pagination=${page}&region=global_v2`, {
      headers: {
        'x-csrftoken': csrftoken.value,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to get ${type} contest ranking: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async getContestSubmission(submissionId: number, region?: string): Promise<ContestSubmission> {
    const response = await fetch(`https://leetcode.${region === 'CN' ? 'cn' : 'com'}/api/submissions/${submissionId}/`);
    if (!response.ok) {
      throw new Error(`Failed to get contest submission: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async reportSubmission(description: string, contestSubmission: number): Promise<ReportResult> {
    const csrftoken = this.fetcher.getCookie('csrftoken');
    if (!csrftoken) {
      throw new Error('No CSRF token found');
    }

    const response = await this.fetcher.fetch('/contest/api/reports/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrftoken': csrftoken.value,
      },
      body: JSON.stringify({
        description,
        submission: contestSubmission,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to report submission: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async solveDailyQuestion(lang: Lang = 'cpp'): Promise<SubmissionDetails> {
    const activeDailyCodingChallengeQuestion = await this.getActiveDailyCodingChallengeQuestion();
    const question = activeDailyCodingChallengeQuestion.question;
    // console.log(question);

    const codeWithRuntime = await this.getCodeWithRuntime(question.questionId, lang);
    // console.log(codeWithRuntime);

    const submissionResult = await this.submitCode(question, lang, codeWithRuntime.code);
    // console.log(submissionResult);

    const submissionDetails = await this.getSubmissionDetails(submissionResult.submission_id);
    return submissionDetails;
  }

  async reportAiGenerated(type: ContestType, week: number, questionId: number | string, magicWord: string, maxPage: number = 30): Promise<ReportResult[]> {
    const reportResults: ReportResult[] = [];
    for (let page = 1; page <= maxPage; page++) {
      const weeklyContestRanking = await this.getContestRanking(type, week, page);
      for (const user of weeklyContestRanking.total_rank) {
        const submissionId = user.submissions[String(questionId)]?.submission_id;
        if (!submissionId) continue;
        // console.log(`checking page: ${page} - ${user.username} - ${submissionId} - ${user.data_region}`);
        try {
          const contestSubmission = await this.getContestSubmission(submissionId, user.data_region);
          if (contestSubmission.code.includes(magicWord)) {
            console.log(`Found cheating: ${user.username} - ${contestSubmission.lang} - rank: ${user.rank}`);
            const reportResult = await this.reportSubmission(`${magicWord}, ai generated.`, contestSubmission.contest_submission);
            reportResults.push(reportResult);
          }
        } catch (error) {
          console.error(`Failed to report cheating: ${error}`);
        }
      }
    }
    return reportResults;
  }

  getAllCookies(): Cookie[] {
    return this.fetcher.getAllCookies();
  }

  saveCookies(): void {
    this.fetcher.saveCookies();
  }

  close(): void {
    this.stopKeepAlive();
    this.saveCookies();
  }

  private async pingGraphQL(): Promise<number> {
    const response = await this.fetcher.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query currentTimestamp {
            currentTimestamp
          }
        `,
        variables: {},
        operationName: 'currentTimestamp',
      }),
    });

    if (!response.ok) {
      console.error('Failed to ping GraphQL endpoint:', response.status, response.statusText);
    }

    const currentTimestamp = (await response.json()).data.currentTimestamp;

    return currentTimestamp;
  }
}
