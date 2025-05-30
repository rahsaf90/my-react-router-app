import type { SvgIconProps } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountIcon from '@mui/icons-material/AccountCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';

export default function AppIcon(props: { icon: string } & SvgIconProps) {
  switch (props.icon) {
    case 'home':
      return <HomeIcon {...props} />;
    case 'lock':
      return <LockIcon {...props} />;
    case 'settings':
      return <SettingsIcon {...props} />;
    case 'account':
      return <AccountIcon {...props} />;
    case 'visibility':
      return <VisibilityIcon {...props} />;
    case 'visibility-off':
      return <VisibilityOffIcon {...props} />;
    case 'email':
      return <EmailIcon {...props} />;

    default:
      return <HomeIcon {...props} />; // Fallback to HomeIcon if no match found
  }
}
