declare global {
  interface Liveblocks {
    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        id: string;
        name: string;
        email: string;
        avatar: string;
        color: string;
      };
    };
  }
}

export {};
export type ThreadMetadata = {

  priority: string;

  pinned: boolean;

  timestamp: number;

};