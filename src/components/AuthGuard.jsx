import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function AuthGuard({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  return children
}
