/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '~/lib/store/store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);

  storeRef.current ??= makeStore();

  return <Provider store={storeRef.current}>{children}</Provider>;
}
