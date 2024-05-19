"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@cryptalbum/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@cryptalbum/components/ui/popover";
import { cn } from "@cryptalbum/lib/utils";

type Props = {
	selections: Array<{
		value: string;
		label: string;
	}>;
	valueType: string;
	selectedValue: string;
	setSelectedValue: (value: string) => void;
};

export default function DropDownList({
	selections,
	valueType,
	selectedValue,
	setSelectedValue,
}: Props) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{selectedValue
						? selections.find(
								(proposition) => proposition.value === selectedValue,
							)?.label
						: `Select ${valueType}`}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder={`search ${valueType}`} />
					<CommandList>
						<CommandEmpty>No {valueType} found.</CommandEmpty>
						<CommandGroup>
							{selections.map((proposition) => (
								<CommandItem
									key={proposition.value}
									value={proposition.value}
									onSelect={(currentValue) => {
										setSelectedValue(
											currentValue === selectedValue ? "" : currentValue,
										);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											selectedValue === proposition.value
												? "opacity-100"
												: "opacity-0",
										)}
									/>
									{proposition.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
