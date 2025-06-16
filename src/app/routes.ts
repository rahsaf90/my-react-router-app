import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from '@react-router/dev/routes';
// import { flatRoutes } from '@react-router/fs-routes';
// ignored for now, as it makes it more difficult to read the routes
// export default flatRoutes() satisfies RouteConfig;
export default [

  layout('pages/_auth/layout.tsx', [ // auth layout, no url prefix
    route('login', 'pages/_auth/login/page.tsx'), // login page. url = '/login'
  ]),

  layout('pages/_dash/layout.tsx', [ // dashboard layout. no url prefix
    index('pages/index.tsx'), // root index page. url = '/'
    route('about', 'pages/_dash/about/page.tsx'), // about page. url = '/about'

    ...prefix('tasks', [ // tasks URL prefix. url = '/tasks'
      // tasks index page (list of tasks). url = '/tasks'
      index('pages/_dash/tasks/page.tsx'),
      // task detail page with dynamic id. url = '/tasks/:id'
      route(':id', 'pages/_dash/tasks/detail/page.tsx'),
      route(':id/edit/', 'pages/_dash/tasks/form/page.tsx'),
    ]), // tasks prefix
    // profile page with dynamic id. url = '/profile/:id'
    route('profile/:id', 'pages/_dash/profile/page.tsx'),
  ]),

] satisfies RouteConfig;
