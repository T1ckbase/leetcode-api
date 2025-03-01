// import { CookieFetcher } from './utils/cookie-fetcher.ts';
// import { findFirstValue } from './utils/find-first-value.ts';
import devices from 'devices' with { type: 'json' };
import { type ContestType, Leetcode } from './mod.ts';
// const fetcher = new CookieFetcher({
//   baseUrl: 'https://leetcode.com',
//   headers: {
//     // 'Host': 'https://leetcode.com',
//     'Origin': 'https://leetcode.com',
//     'User-Agent': devices['Desktop Chrome'].userAgent,
//   },
//   cookieFile: 'cookies.json',
// });

// const response = await fetcher.fetch('/problemset');
// console.log(response.status, response.statusText);

// const parser = new DOMParser();
// const document = parser.parseFromString(await response.text(), 'text/html');

// const nextData = document.querySelector('#__NEXT_DATA__')?.textContent;
// if (!nextData) {
//   throw new Error('No __NEXT_DATA__ found');
// }
// const dailyCodingChallengeV2 = findFirstValue(JSON.parse(nextData), 'dailyCodingChallengeV2');
// console.log(dailyCodingChallengeV2);

// fetcher.saveCookies();

const leetcode = new Leetcode({
  headers: {
    'User-Agent': devices['Desktop Chrome'].userAgent,
  },
  cookieFile: 'cookies.json',
});

// console.log((await leetcode.getUserStatus()).isSignedIn);
// console.log(await leetcode.checkIn());
// console.log(await leetcode.collectContestEasterEgg());

// const activeDailyCodingChallengeQuestion = await leetcode.getActiveDailyCodingChallengeQuestion();
// // console.log(dailyCodingChallengeV2);
// const question = activeDailyCodingChallengeQuestion.question;
// console.log(question);

// const codeWithRuntime = await leetcode.getCodeWithRuntime(question.questionId, 'cpp');
// console.log(codeWithRuntime);

// const submissionResult = await leetcode.submitCode(question, 'cpp', codeWithRuntime.code);
// console.log(submissionResult);

// const submissionDetails = await leetcode.getSubmissionDetails(submissionResult.submission_id);
// console.log(submissionDetails);

// const submissionDetails = await leetcode.solveDailyQuestion();
// console.log(submissionDetails);

// const reportResult = await leetcode.reportSubmission('ai generated', 22365159);
// console.log(reportResult);

const contestType: ContestType = 'weekly';
const week = 437;
const magicWord = 'velmocretz';

const contest = await leetcode.getContest(contestType, week);
console.log(contest.questions.map((q) => `${q.title_slug} - ${q.question_id}`));

// const weeklyContestRanking = await leetcode.getContestRanking('weekly', week);
// console.log(weeklyContestRanking);

const reportResult = await leetcode.reportAiGenerated(contestType, week, contest.questions[2].question_id, magicWord);
console.log(reportResult.length);

leetcode.close();
