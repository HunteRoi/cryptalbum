import Link from "next/link";

type Props = {
	link: {
		href: string;
		text: string;
	};
	contents: string;
};

export default function RedirectionLink({ link, contents }: Props) {
	return (
		<div className="mt-4 text-center text-sm">
			{contents}{" "}
			<Link href={link.href} className="underline">
				{link.text}
			</Link>
		</div>
	);
}
