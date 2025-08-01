export enum ResponseStatus {
	Success = "success",
	Failure = "failure",
	Warning = "warning",
}

export interface ServerResponse<T> {
	status: ResponseStatus;
	message?: string;
	data?: T;
}
