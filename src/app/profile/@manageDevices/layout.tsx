export default function Layout({
    children,
    trustedDevices,
    untrustedDevices,
  }: {
    children: React.ReactNode
    untrustedDevices: React.ReactNode
    trustedDevices: React.ReactNode
  }) {
    return (
      <div className="flex flex-row gap-2">
        {children}
        {trustedDevices}
        {untrustedDevices}
      </div>
    );
  }