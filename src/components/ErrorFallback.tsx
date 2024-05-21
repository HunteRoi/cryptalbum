"use client";

import { useEffect } from "react";

import { useToast } from "@cryptalbum/components/ui/use-toast";

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorFallback(
	{ isGlobalError } = { isGlobalError: false },
) {
	return function ErrorHandler({ error, reset }: ErrorProps) {
		useError(error);

		return isGlobalError ? <ErrorDisplay reset={reset} /> : <GlobalErrorDisplay reset={reset} />;
	};
}

function useError(error: ErrorProps['error']) {
	const { toast } = useToast();

	useEffect(() => {
		const message =
			"message" in error
				? error.message
				: "An error occurred, and we failed to catch it before you did.";
		toast({
			title: "This is problematic!",
			description: message,
			variant: "destructive",
		});
	}, [toast, error]);
}

function ErrorDisplay({ reset }: Pick<ErrorProps, 'reset'>) {
	return (
		<div>
			<h1>Oops!</h1>
			<p>Well. We fucked up... Sorry?</p>
			<button type="button" onClick={reset}>
				Try again, perhaps it fixed itself
			</button>
		</div>
	);
}

function GlobalErrorDisplay({ reset }: Pick<ErrorProps, 'reset'>) {
	return (
		<html lang="en">
			<body>
				<h1>Oops!</h1>
				<p>
					Too bad, you encountered an error that broke the hella great site we
					made.
				</p>
				<button type="button" onClick={reset}>
					Wanna try again?
				</button>
			</body>
		</html>
	);
}
