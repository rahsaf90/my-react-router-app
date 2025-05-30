import { index, layout, prefix, route, type RouteConfig } from '@react-router/dev/routes';
// import { flatRoutes } from '@react-router/fs-routes'; // ignored for now, as it makes it more difficult to read the routes
// export default flatRoutes() satisfies RouteConfig;
export default [
  index('pages/index.tsx'), // root index page. url = '/'

  layout('pages/_auth/layout.tsx', [ // auth layout, no url prefix
    route('login', 'pages/_auth/login/page.tsx'), // login page. url = '/login'
  ]),

  layout('pages/_dash/layout.tsx', [ // dashboard layout. no url prefix
    route('about', 'pages/_dash/about/page.tsx'), // about page. url = '/about'

    ...prefix('tasks', [ // tasks URL prefix. url = '/tasks'
      index('pages/_dash/tasks/page.tsx'), // tasks index page ( list of tasks ). url = '/tasks'
      route(':id', 'pages/_dash/tasks/detail/page.tsx'), // task detail page with dynamic id. url = '/tasks/:id'
    ]), // tasks prefix

    route('profile/:id', 'pages/_dash/profile/page.tsx'), // profile page with dynamic id. url = '/profile/:id'
  ]),

] satisfies RouteConfig;
