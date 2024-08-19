import { CyberCloud } from "@dad1909/cybersoda";

export interface userDetail {
  email: string;
  username: string;
  imageUrl: string;
  server: string;
}
export interface ChatBody {
  inputMessage: string;
  prompType: string;
  length: number;
  serverSend: string;
}

export interface KafkaBody {
  inputMessage: string;
  prompType: string;
  length: number;
  cloud: CyberCloud;
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
  detail: string | null;
  createdAt: Date;
}