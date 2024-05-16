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
      <>
        {children}
        {trustedDevices}
        {untrustedDevices}
      </>
    )
  }