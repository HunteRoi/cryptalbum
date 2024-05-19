import React from "react";

import { ScrollArea } from "@cryptalbum/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@cryptalbum/components/ui/table";
import { api } from "@cryptalbum/trpc/react";
import UserActivityTableRow from "./UserActivityTableRow";
import type { Activity } from "./types";

export default function UserActivityTable() {
	const {
		data: activity,
		isLoading,
		isError,
		isSuccess,
	} = api.auth.checkActivity.useQuery();

	return (
		<ScrollArea>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Activity</TableHead>
						<TableHead>Timestamp</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{activity?.map((activity: Activity) => (
						<UserActivityTableRow key={activity.id} activity={activity} />
					))}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={2} className="text-center">
							{isLoading ? "Loading..." : null}
							{isError ? "An error occurred while fetching your devices" : null}
							{isSuccess && activity?.length === 0
								? "No activity recorded yet."
								: null}
							{isSuccess && activity?.length && activity?.length > 0
								? `${activity?.length} rows.`
								: null}
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</ScrollArea>
	);
}
