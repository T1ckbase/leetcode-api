// deno-lint-ignore-file no-explicit-any

export interface UserStatus {
  userId: number;
  isSignedIn: boolean;
  isMockUser: boolean;
  isPremium: boolean;
  isVerified: boolean;
  username: string;
  realName: string;
  avatar: string;
  isAdmin: boolean;
  isSuperuser: boolean;
  permissions: any[];
  isTranslator: boolean;
  activeSessionId: number;
  checkedInToday: boolean;
  completedFeatureGuides: string[];
  notificationStatus: {
    lastModified: number;
    numUnread: number;
  };
}
