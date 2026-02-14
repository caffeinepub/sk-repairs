import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { AuthGate } from './components/auth/AuthGate';
import { LoginButton } from './components/auth/LoginButton';
import { ProfileSetupDialog } from './components/auth/ProfileSetupDialog';
import JobsDashboardPage from './pages/JobsDashboardPage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobUpsertPage from './pages/JobUpsertPage';
import SettingsPage from './pages/SettingsPage';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  return (
    <AuthGate>
      <ProfileSetupDialog />
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGate>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: JobsDashboardPage,
});

const jobDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$jobId',
  component: JobDetailsPage,
});

const addJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/new',
  component: JobUpsertPage,
});

const editJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$jobId/edit',
  component: JobUpsertPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  jobDetailsRoute,
  addJobRoute,
  editJobRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
