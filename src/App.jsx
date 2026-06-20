import { Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Landing from "./pages/Landing"
import AuthPage from "./pages/Auth"
import ChatPage from "./pages/Chat"
import DashboardPage from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import AuthGuard from "./components/AuthGuard"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default App
