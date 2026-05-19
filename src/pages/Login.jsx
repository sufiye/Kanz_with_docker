import NavbarLR from "../components/NavbarLR";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useTokens } from "../stores/tokenStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDarkmode } from "../stores/store";
import api from "../utils/axios";

const Login = () => {
  const navigate = useNavigate();

  const { setAccessToken, setRefreshToken, setRoles } = useTokens();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { isDarkmodeEnabled } = useDarkmode();

  const handleInputChange = (title, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [title]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      if (!formData.email || !formData.password) {
        toast.error("Fill all fields!");
        return;
      }

      const res = await api.post("/Auth/login", formData);

      const data = res?.data;

      if (!data) {
        toast.error("Invalid response from server");
        return;
      }

      setAccessToken(data?.accessToken || "");
      setRefreshToken(data?.refreshToken || "");

      const rolesArray =
        Array.isArray(data?.roles)
          ? data.roles
          : data?.roles
          ? [data.roles]
          : [];

      setRoles(rolesArray);

      toast.success("Login successful");
      navigate("/");

    } catch (error) {
      console.error("LOGIN ERROR:", error?.response?.data || error);
      toast.error(
        error?.response?.data?.message ||
        "Email or password incorrect!"
      );
    }
  };

  return (
    <div
      className={`w-full min-h-screen transition-all
        ${
          isDarkmodeEnabled
            ? "bg-[#1c1814] text-[#e6dccf]"
            : "bg-[#f4efe7] text-[#3a3835]"
        }`}
    >
      <NavbarLR />

      <div className="flex justify-center items-center my-20 px-4">
        <div
          className={`w-full max-w-md p-10 rounded-2xl shadow-sm
                ${isDarkmodeEnabled ? "bg-[#26221d]" : "bg-white"}`}
        >
          <h1 className="text-2xl text-center mb-8 tracking-[3px]">
            LOGIN
          </h1>

          <input
            value={formData?.email}
            onChange={(e) =>
              handleInputChange("email", e.target.value)
            }
            className={`w-full p-3 mb-4 border rounded-lg text-sm transition
                        focus:outline-none
                        ${
                          isDarkmodeEnabled
                            ? "bg-[#1c1814] border-[#3a342c] text-white placeholder:text-[#a8a093]"
                            : "bg-[#f9f6f1] border-[#ddd] text-black placeholder:text-gray-500"
                        }`}
            placeholder="Email"
            type="email"
          />

          <input
            value={formData?.password}
            onChange={(e) =>
              handleInputChange("password", e.target.value)
            }
            className={`w-full p-3 mb-4 border rounded-lg text-sm transition
                        focus:outline-none
                        ${
                          isDarkmodeEnabled
                            ? "bg-[#1c1814] border-[#3a342c] text-white placeholder:text-[#a8a093]"
                            : "bg-[#f9f6f1] border-[#ddd] text-black placeholder:text-gray-500"
                        }`}
            placeholder="Password"
            type="password"
          />

          <Link to={"/register"}>
            <p className="text-xs mb-6 opacity-70 hover:opacity-100 cursor-pointer">
              Don’t have an account?
            </p>
          </Link>

          <button
            onClick={handleLogin}
            className="w-full border py-3 text-sm tracking-wide transition
                        hover:bg-black hover:text-white"
          >
            LOGI
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
