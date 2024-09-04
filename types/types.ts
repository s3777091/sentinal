export interface userDetail {
  email: string;
  username: string;
  userid: number;
  imageUrl: string;
}
export interface ChatBody {
  user: string;
  inputMessage: string;
  prompType: string;
  length: number;
  newConversation: boolean;
}

export interface AIMessage {
  username: string;
  message: string;
  modelType: string;
  type: string;
  lendata: number;
}
export interface ScanArray {
  id: number;
  title: string;
  level: string;
  more_detail: string;
  severity: "Critical" | "High" | "Medium";
}

export interface ScanInput {
  github: string;
  language: string;
  token: string;
  user: string;
}

export interface LanguagePatterns {
  extractFunctionsAndClasses: (code: string) => string[];
}

export interface FileContent {
  path: string;
  content: string[];
}

export interface userRecordDb {
  id: number;
  email: string;
  username: string;
  name: string | null;
  apiServerId: number | null;
}

export interface Post {
  id: number;
  author: {
    id: number;
    username: string;
    image: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    image: string | null;
    bio: string | null;
  };
  comments: Array<{
    id: number;
    content: string;
    createdAt: Date;
    author: {
      id: number;
      username: string;
      image: string | null;
    };
  }>;
};