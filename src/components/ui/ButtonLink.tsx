import Button from '@mui/material/Button';

import { Link } from 'react-router';

import type { ButtonProps } from '@mui/material/Button';
import type { ReactNode } from 'react';

interface ButtonLinkProps extends ButtonProps {
  children?: ReactNode
  to: string
}

export default function ButtonLink({
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Button component={Link} {...props}>
      {children}
    </Button>
  );
}
