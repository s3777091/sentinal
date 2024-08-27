export interface userDetail {
  email: string;
  username: string;
  imageUrl: string
}
export interface ChatBody {
  user: string;
  inputMessage: string;
  prompType: string;
  length: number
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