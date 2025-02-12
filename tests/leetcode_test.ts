import { assertEquals } from '@std/assert';
import { Leetcode } from '../leetcode.ts';
import devices from 'devices' with { type: 'json' };

Deno.test('Leetcode API Tests', async (t) => {
  const leetcode = new Leetcode({
    headers: {
      'User-Agent': devices['Desktop Chrome'].userAgent,
    },
    cookieFile: 'cookies.json',
  });

  await t.step('is signed in', async () => {
    const userStatus = await leetcode.getUserStatus();
    assertEquals(userStatus.isSignedIn, true);
  });

  await t.step('check in', async () => {
    const result = await leetcode.checkIn();
    assertEquals(result, true);
  });

  await t.step('collect contest easter egg', async () => {
    const result = await leetcode.collectContestEasterEgg();
    assertEquals(result, true);
  });

  leetcode.close();
});
