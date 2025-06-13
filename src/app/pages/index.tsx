// import type { Route } from './+types/index';

import { Link } from 'react-router';

export function meta() { // {}: Route.MetaArgs
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Component() {
  return (
    <div>
      <h1>Welcome to the React Router App</h1>
      <p>This is the home page.</p>
      <hr />
      <h2> Link playground</h2>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/tasks">Tasks</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </div>

  );
}
