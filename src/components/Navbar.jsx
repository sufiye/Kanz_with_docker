import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDarkmode } from "../stores/store"
import { useTokens } from "../stores/tokenStore"
import { useEffect, useState } from "react"
import api from "../utils/axios"

const Navbar = ({
  searchterm = "",
  setSearchterm = () => {},
  selectedCategory = "",
  setSelectedCategory = () => {}
}) => {
  const { toggleDarkmode, isDarkmodeEnabled } = useDarkmode()
  const { accessToken, clearTokens, roles } = useTokens()
  const navigate = useNavigate()
  const location = useLocation()

  const [categories, setCategories] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const isHomePage = location.pathname === "/"
  const isAdmin = roles?.includes("Admin") || false

  const getCategories = async () => {
    try {
      const res = await api.get("/Category")
      setCategories(Array.isArray(res?.data) ? res.data : [])
    } catch (error) {
      console.error(error)
      setCategories([])
    }
  }

  useEffect(() => {
    if (isHomePage) {
      getCategories()
    }
  }, [isHomePage])

  const handleProtectedRoute = (path) => {
    if (!accessToken) {
      navigate("/login")
    } else {
      navigate(path)
    }
    setMenuOpen(false)
  }

  return (
    <div className={`w-full px-6 sm:px-12 py-4 sm:py-6 text-sm transition
      ${isDarkmodeEnabled
        ? "bg-[#1c1814] text-[#e6dccf]"
        : "bg-[#f4efe7] text-[#3a3835]"
      }`}>

      <div className="flex justify-between items-center">

        <h1
          className="text-lg sm:text-xl tracking-[3px] font-semibold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Kanz
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 tracking-wide">

          <Link to="/">Home</Link>

          {!isAdmin && (
            <button onClick={() => handleProtectedRoute("/BasketItems")}>
              Basket
            </button>
          )}

          <button onClick={() => handleProtectedRoute("/orders")}>
            Order
          </button>

          {isHomePage && (
            <>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-2 text-xs rounded-lg border
                ${isDarkmodeEnabled
                  ? "bg-[#26221d] border-[#3a342c] text-white"
                  : "bg-white border-[#ddd] text-black"
                }`}
              >
                <option value="">All</option>
                {Array.isArray(categories) &&
                  categories.map(c => (
                    <option key={c?.id} value={c?.id}>
                      {c?.name}
                    </option>
                  ))
                }
              </select>

              <input
                placeholder="Search"
                type="search"
                value={searchterm || ""}
                onChange={(e) => setSearchterm(e.target.value)}
                className={`px-4 py-2 text-xs rounded-lg border
                ${isDarkmodeEnabled
                  ? "bg-[#26221d] border-[#3a342c] text-white"
                  : "bg-white border-[#ddd] text-black"
                }`}
              />
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-5">

          <button onClick={toggleDarkmode}>
            {isDarkmodeEnabled ? "☀️" : "🌙"}
          </button>

          <div className="hidden md:block">
            {accessToken ? (
              <button
                onClick={() => {
                  clearTokens()
                  navigate("/login")
                }}
                className="border px-5 py-2 text-xs hover:bg-black hover:text-white"
              >
                LOGOUT
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="border px-5 py-2 text-xs hover:bg-black hover:text-white"
              >
                SIGN IN
              </button>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">

          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>

          {!isAdmin && (
            <button onClick={() => handleProtectedRoute("/BasketItems")}>
              Basket
            </button>
          )}

          <button onClick={() => handleProtectedRoute("/orders")}>
            Order
          </button>

          {isHomePage && (
            <>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border"
              >
                <option value="">All</option>
                {Array.isArray(categories) &&
                  categories.map(c => (
                    <option key={c?.id} value={c?.id}>
                      {c?.name}
                    </option>
                  ))
                }
              </select>

              <input
                placeholder="Search"
                type="search"
                value={searchterm || ""}
                onChange={(e) => setSearchterm(e.target.value)}
                className="px-4 py-2 text-xs rounded-lg border"
              />
            </>
          )}

          {accessToken ? (
            <button
              onClick={() => {
                clearTokens()
                navigate("/login")
                setMenuOpen(false)
              }}
              className="border px-4 py-2 text-xs"
            >
              LOGOUT
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/login")
                setMenuOpen(false)
              }}
              className="border px-4 py-2 text-xs"
            >
              SIGN I
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar
