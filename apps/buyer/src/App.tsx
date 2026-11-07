import { createBrowserRouter, RouterProvider } from 'react-router'
import Shell from './shell.js'
import OrdersPage from './routes/orders/index.js'
import OrderDetailPage from './routes/orders/detail.js'
import BriefPage from './routes/briefs/index.js'
import ApplicationsPage from './routes/applications/index.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <OrdersPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:orderId', element: <OrderDetailPage /> },
      { path: 'briefs/new', element: <BriefPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
