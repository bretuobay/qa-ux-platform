import { createBrowserRouter, RouterProvider } from 'react-router'
import Shell from './shell.js'
import DashboardPage from './routes/dashboard/index.js'
import QueuePage from './routes/queue/index.js'
import OrderDeskPage from './routes/desk/index.js'
import WorkPage from './routes/work/index.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'queue', element: <QueuePage /> },
      { path: 'orders/:orderId', element: <OrderDeskPage /> },
      { path: 'work', element: <WorkPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
