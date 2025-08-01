import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export function getSession() {
	return getServerSession(authOptions);
}
