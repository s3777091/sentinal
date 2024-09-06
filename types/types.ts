export interface UserDetail {
  email: string;
  username: string;
  userid: string;
  imageUrl: string | null; // Allow for null in case the user does not have an image
}

export interface ChatBody {
  userID: string;
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

export interface UserRecordDb {
  id: number;
  email: string;
  username: string;
  name: string | null; // Name can be null
  apiServerId: number | null; // Server ID can be null
}

export interface Post {
  id: number;
  author: {
    id: number;
    username: string;
    image: string | null; // Image can be null
  };
  content: string;
  createdAt: string;
  comments: Array<{
    id: number;
    author: {
      id: number;
      image: string | null;
    };
  }>;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string | null; // Content can be null
  imageUrl: string | null; // Image can be null
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    image: string | null; // Image can be null
  };
  comments: Array<{
    id: number;
    content: string;
    createdAt: Date;
    author: {
      id: number;
      username: string;
      image: string | null; // Commenter's image can be null
    };
  }>;
}