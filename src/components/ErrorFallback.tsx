"use client";

import { useEffect } from "react";

import { useToast } from "@cryptalbum/components/ui/use-toast";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

type ErrorFallbackProps = {
    isGlobalError?: boolean;
};
export default function ErrorFallback({ isGlobalError }: ErrorFallbackProps = { isGlobalError: false }) {
    return ({ error, reset }: ErrorProps) => {
        const { toast } = useToast();

        useEffect(() => {
            const message = 'message' in error ? error.message : "An error occurred, and we failed to catch it before you did.";
            toast({
                title: "This is problematic!",
                description: message,
                variant: "destructive",
            });
        }, [toast, error]);

        return isGlobalError
            ? (
                <div>
                    <h1>Oops!</h1>
                    <p>Well. We fucked up... Sorry?</p>
                    <button type='button' onClick={reset}>Try again, perhaps it fixed itself</button>
                </div>
            )
            : (
                <html lang='en'>
                    <body>
                        <h1>Oops!</h1>
                        <p>Too bad, you encountered an error that broke the hella great site we made.</p>
                        <button type='button' onClick={reset}>Wanna try again?</button>
                    </body>
                </html>
            );
    };
}
