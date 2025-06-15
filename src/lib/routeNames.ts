import { matchPath } from 'react-router';

const RouteNames: Record<string, string> = {
  '/': 'Home',
  '/login': 'Login',
  '/dashboard': 'Dashboard',
  '/about': 'About',
  '/tasks': 'Task Management',
  '/tasks/:id': 'Task Detail',
  '/profile/:id': 'Profile',
};

export default function getRouteName(path: string): string {
  const currentRoute = Object.keys(RouteNames).find((route) => {
    return matchPath(route, path) !== null;
  });

  // Return the route name or a default if not found
  return RouteNames[currentRoute ?? path] || 'Unknown Route';
}
