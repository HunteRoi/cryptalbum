import React from "react";

import { TableCell, TableRow } from "@cryptalbum/components/ui/table";
import type { Activity } from "./types";

type UserActivityTableRowProps = {
	activity: Activity;
};

export default function UserActivityTableRow({
	activity,
}: UserActivityTableRowProps) {
	return (
		<TableRow key={activity.id}>
			<TableCell className="font-bold">{activity.message}</TableCell>
			<TableCell className="text-right">
				{activity.createdAt.toISOString()}
			</TableCell>
		</TableRow>
	);
}
