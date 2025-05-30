import LoginForm from './form';

import type { Route } from './+types/route';

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'App Login' },
    { name: 'description', content: 'Login Page!' },
  ];
}

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <p>Please enter your credentials to log in.</p>
      <LoginForm />
    </div>
  );
}
