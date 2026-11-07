import { createBrowserRouter, RouterProvider } from 'react-router'
import OrdersPage from './routes/orders/index.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <OrdersPage />,
  },
  {
    path: '/orders',
    element: <OrdersPage />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
