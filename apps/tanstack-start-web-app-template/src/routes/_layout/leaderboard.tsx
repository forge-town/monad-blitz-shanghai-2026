import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/leaderboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/leaderboard"!</div>
}
