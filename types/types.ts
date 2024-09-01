export interface userDetail {
  email: string;
  username: string;
  imageUrl: string
}
export interface ChatBody {
  user: string;
  inputMessage: string;
  prompType: string;
  length: number,
  newConversation: boolean
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
  detail: string;
  more_detail: string;
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

export interface userRecordDb {
  id: number;
  email: string;
  username: string;
  name: string | null;
  apiServerId: number | null;
}
