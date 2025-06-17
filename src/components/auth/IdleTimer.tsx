import { Modal, Typography } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { SESSION_TIMEOUT } from '~/lib/store/constants';
import { isAuthenticated, refreshSession, sessionDate } from '~/lib/store/features/authSlice';
import { useAppDispatch, useAppSelector } from '~/lib/store/hooks';
import ButtonLink from '../ui/ButtonLink';
import ModalBox from '../ui/StyledModalBox';

const timeout = SESSION_TIMEOUT;
const throttle = 1_000; // 1 second
const promptBeforeIdle = 4_000; // 4 seconds before idle
const offset_mins = 5; // 5 minutes before expiry to show idle message

const IdleTimerComponent = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(isAuthenticated);
  const expiryDate = useAppSelector(sessionDate);

  const [showIdle, setShowIdle] = useState(false);

  const isExpired = () => {
    if (!expiryDate) return false;
    return moment().isAfter(moment(expiryDate));
  };

  const isAlmostExpired = () => {
    if (!expiryDate) return false;
    const expiryMoment = moment(expiryDate);
    return expiryMoment.diff(moment(), 'minutes') <= offset_mins; // 5 minutes before expiry
  };

  const showIdleMessage = () => setShowIdle(true);

  const hideIdleMessage = (event: unknown, reason: string) => {
    if (reason !== 'backdropClick') {
      setShowIdle(false);
    }
  };

  const onIdle = () => showIdleMessage();
  const onActive = () => {
    // called when user becomes active again , back to browser tab, etc.
    if (isExpired()) {
      showIdleMessage();
    }
    else if (isAlmostExpired()) {
      void dispatch(refreshSession());
    }
  };

  const onAction = () => {
    // called when user does something, like mouse move, key press, etc.
    if (isExpired()) {
      showIdleMessage();
    }
    else if (isAlmostExpired()) {
      void dispatch(refreshSession());
    }
  };

  useIdleTimer({
    disabled: !isLoggedIn,
    timeout,
    onIdle,
    onActive,
    onAction,
    throttle,
    promptBeforeIdle,
  });

  useEffect(() => {
    void dispatch(refreshSession()); // Initial session refresh on mount
  }, [dispatch]);

  return (
    <Modal open={showIdle} onClose={hideIdleMessage}>
      <ModalBox>
        <Typography variant="h6" component="h2">
          Your session is about to expire!
        </Typography>
        <Typography sx={{ mt: 2 }}>
          You have been idle for a while, hence you have been logged out.
          Please log in again to continue.
        </Typography>
        <ButtonLink to="/login" variant="contained" color="primary" sx={{ mt: 2 }}>
          Go to Login
        </ButtonLink>
      </ModalBox>
    </Modal>
  );
};

export default IdleTimerComponent;
