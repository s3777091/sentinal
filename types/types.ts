export interface userDetail {
  username: string;
  imageUrl: string;
}
export interface ChatBody {
  inputMessage: string;
  prompType: string;
  length: number;
}

export interface SpaceStatusNormal {
	status: "sleeping" | "running" | "building" | "error" | "stopped";
	detail:
		| "SLEEPING"
		| "RUNNING"
		| "RUNNING_BUILDING"
		| "BUILDING"
		| "NOT_FOUND";
	load_status: "pending" | "error" | "complete" | "generating";
	message: string;
}