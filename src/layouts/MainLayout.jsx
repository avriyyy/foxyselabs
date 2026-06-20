import { Outlet, useLocation } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

export default function MainLayout() {
  const location = useLocation()
  const isChat = location.pathname === "/chat"

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-neon selection:text-white">
      {!isChat && <NavBar />}
      <Outlet />
      {!isChat && <Footer />}
    </div>
  )
}
