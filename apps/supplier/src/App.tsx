import { createBrowserRouter, RouterProvider } from 'react-router'
import Shell from './shell.js'
import DashboardPage from './routes/dashboard/index.js'
import QueuePage from './routes/queue/index.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'queue', element: <QueuePage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
