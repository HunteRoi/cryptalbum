export default function Layout({
	children,
	changeKeyPair,
	deleteAccount,
}: {
	children: React.ReactNode;
	changeKeyPair: React.ReactNode;
	deleteAccount: React.ReactNode;
}) {
	return (
		<div className="flex flex-row gap-2">
			{children}
			{changeKeyPair}
			{deleteAccount}
		</div>
	);
}
