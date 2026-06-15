import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useContext, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { Slide, toast } from "react-toastify";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

const changePasswordSchema = zod
  .object({
    password: zod
      .string()
      .nonempty("Current password is required")
      .regex(
        passwordRegex,
        "Password must be 8–15 characters with uppercase, lowercase, number, and special character."
      ),
    newPassword: zod
      .string()
      .nonempty("New password is required")
      .regex(
        passwordRegex,
        "Password must be 8–15 characters with uppercase, lowercase, number, and special character."
      ),
    confirmNewPassword: zod.string().nonempty("Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.password !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

function PasswordInput({ id, placeholder, register, error, touched }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          id={id}
          {...register(id)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
      </div>
      {error && touched && (
        <p className="text-red-500 text-xs">{error.message}</p>
      )}
    </div>
  );
}

export default function ChangePassword() {
  const { token, setAuthenticatedUserToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const { handleSubmit, register, formState, reset } = useForm({
    mode: "onBlur",
    resolver: zodResolver(changePasswordSchema),
  });

  const { errors, touchedFields } = formState;

  function handleChangePassword(values) {
    setIsLoading(true);
    setApiError(null);

    axios
      .patch(
        "https://route-posts.routemisr.com/users/change-password",
        { password: values.password, newPassword: values.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const newToken = res.data?.data?.token;
        if (newToken) {
          setAuthenticatedUserToken(newToken);
          localStorage.setItem("token", newToken);
        }
        reset();
        toast.success("Password changed successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Slide,
        });
        setTimeout(() => navigate("/home"), 2000);
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          err.response?.data?.errors ||
          "Something went wrong. Please try again.";
        setApiError(typeof message === "string" ? message : JSON.stringify(message));
        setTimeout(() => setApiError(null), 4000);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4">

      {/* Brand */}
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-bold text-[#1877F2] tracking-tight">meetra</h1>
        <p className="text-gray-600 mt-2 text-lg">Keep your account secure.</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md w-full max-w-[400px] p-6">

        {/* Icon + heading */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center mb-3">
            <FiLock size={22} className="text-[#1877F2]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enter your current password, then choose a new one.
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg px-4 py-2 mb-4">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleChangePassword)} className="flex flex-col gap-3">

          <PasswordInput
            id="password"
            placeholder="Current password"
            register={register}
            error={errors.password}
            touched={touchedFields.password}
          />

          <PasswordInput
            id="newPassword"
            placeholder="New password"
            register={register}
            error={errors.newPassword}
            touched={touchedFields.newPassword}
          />

          <PasswordInput
            id="confirmNewPassword"
            placeholder="Confirm new password"
            register={register}
            error={errors.confirmNewPassword}
            touched={touchedFields.confirmNewPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#1464D2] text-white font-semibold rounded-lg py-3 text-base transition disabled:opacity-70 cursor-pointer mt-1"
          >
            {isLoading ? <ClipLoader size={20} color="#fff" /> : "Update Password"}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-[#1877F2] text-sm hover:underline"
            >
              <FiArrowLeft size={14} />
              Back to login
            </Link>
          </div>

        </form>
      </div>

      <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} Meetra</p>
    </div>
  );
}