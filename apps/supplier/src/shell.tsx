import { Link, Outlet } from 'react-router'

export default function Shell() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Operator</p>
            <p className="text-lg font-semibold">QA & UX</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/queue" className="hover:underline">
              Queue
            </Link>
            <Link to="/work" className="hover:underline">
              Testing work
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
