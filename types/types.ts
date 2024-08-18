import { CyberCloud } from "@dad1909/cybersoda";

export interface userDetail {
  username: string;
  imageUrl: string;
}
export interface ChatBody {
  inputMessage: string;
  prompType: string;
  length: number;
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
