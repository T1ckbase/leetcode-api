import { type Cookie, getSetCookies } from '@std/http/cookie';
import { existsSync } from '@std/fs';

export type FetcherConfig = {
  baseUrl: string;
  headers?: HeadersInit;
  cookies?: string | Cookie[];
  cookieFile?: string;
};

export class CookieFetcher {
  private baseUrl: string;
  private headers: HeadersInit;
  private cookies: Map<string, Cookie>;
  private cookieFile: string | undefined;

  constructor(config: FetcherConfig) {
    this.baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
    this.headers = config.headers || {};
    this.cookies = new Map();
    this.cookieFile = config.cookieFile;
    if (config.cookies) {
      this.initializeCookies(config.cookies);
    } else if (this.cookieFile) {
      this.loadCookiesFromFile();
    }
  }

  private initializeCookies(cookies: string | Cookie[]): void {
    if (typeof cookies === 'string') {
      // Parse cookie string (e.g., "name1=value1; name2=value2")
      const cookiePairs = cookies.split(';').map((pair) => pair.trim());
      for (const pair of cookiePairs) {
        const [name, value] = pair.split('=');
        this.cookies.set(name, { name, value });
      }
    } else {
      // Handle array of Cookie objects
      for (const cookie of cookies) {
        this.cookies.set(cookie.name, cookie);
      }
    }
  }

  private getCookieHeader(): string {
    return Array.from(this.cookies.values())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
  }

  private updateCookies(response: Response): void {
    const newCookies = getSetCookies(response.headers);
    for (const cookie of newCookies) {
      this.cookies.set(cookie.name, cookie);
    }
  }

  private loadCookiesFromFile(): void {
    try {
      if (!this.cookieFile || !existsSync(this.cookieFile)) {
        return;
      }

      const fileContent = Deno.readTextFileSync(this.cookieFile);
      const storedCookies: Cookie[] = JSON.parse(fileContent);

      for (const cookie of storedCookies) {
        // Convert stored date string back to Date object if it exists
        const cookieObj: Cookie = {
          ...cookie,
          expires: cookie.expires ? new Date(cookie.expires) : undefined,
        };
        this.cookies.set(cookie.name, cookieObj);
      }
    } catch (error) {
      console.error('Error loading cookies from file:', error);
    }
  }

  private saveCookiesToFile(): void {
    try {
      if (!this.cookieFile) {
        return;
      }

      const cookiesToStore: Cookie[] = Array.from(this.cookies.values());

      Deno.writeTextFileSync(this.cookieFile, JSON.stringify(cookiesToStore, null, 2));
    } catch (error) {
      console.error('Error saving cookies to file:', error);
    }
  }

  async fetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const cookieHeader = this.getCookieHeader();

    const finalHeaders = new Headers(this.headers);
    if (cookieHeader) {
      finalHeaders.set('Cookie', cookieHeader);
    }
    // console.log({
    //   ...init,
    //   headers: {
    //     ...Object.fromEntries(finalHeaders),
    //     ...init?.headers,
    //   },
    // });
    // Deno.exit(0);

    const response = await fetch(url, {
      ...init,
      headers: {
        ...Object.fromEntries(finalHeaders),
        ...init?.headers,
      },
    });

    this.updateCookies(response);
    return response;
  }

  setCookie(cookie: Cookie): void {
    this.cookies.set(cookie.name, cookie);
  }

  getCookie(name: string): Cookie | undefined {
    return this.cookies.get(name);
  }

  getAllCookies(): Cookie[] {
    return Array.from(this.cookies.values());
  }

  clearCookies(): void {
    this.cookies.clear();
  }

  saveCookies(): void {
    if (this.cookieFile) {
      this.saveCookiesToFile();
    }
  }
}
