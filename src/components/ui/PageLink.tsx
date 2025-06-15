import { Link, type LinkProps } from '@mui/material';

import { Link as RouterLink } from 'react-router';

export default function PageLink(
  {
    to,
    children,
    ...props
  }: LinkProps & { children: React.ReactNode, to: string },
) {
  return (
    <Link
      component={RouterLink}
      to={to}
      {...props}
    >
      {children}
    </Link>
  );
}
