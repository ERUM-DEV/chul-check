import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree'

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <RouterProvider router={router} />
  )
} 