import { createBrowserRouter, RouterProvider } from 'react-router'
import DashboardPage from './routes/dashboard/index.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
