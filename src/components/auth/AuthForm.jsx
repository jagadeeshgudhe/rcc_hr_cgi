import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/AuthForm.css";
import { registerUser } from "../../api/authApi";

const EyeIcon = ({ open, onClick }) => (
  <span className="password-toggle" tabIndex={0} role="button" aria-label="Toggle password visibility" onClick={onClick}>
    {open ? (
      // Eye open SVG
      <svg width="22" height="22" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
    ) : (
      // Eye closed SVG
      <svg width="22" height="22" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.38 0 2.63-.56 3.54-1.47"/></svg>
    )}
  </span>
);

const EmailIcon = () => (
  <span className="email-icon email-icon-end">
    <svg width="20" height="20" fill="none" stroke="#4b5563" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
  </span>
);

const DownArrowIcon = () => (
  <span className="select-arrow">
    <svg width="18" height="18" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
  </span>
);

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [transitionClass, setTransitionClass] = useState("");
  const [username, setUsername] = useState("");
  const [usermail, setUsermail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    // setRegisteredUsers(storedUsers); // This line is removed as per the edit hint
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const data = await login({ username, password });
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      }
      // Use the role from the login response
      const userRole = data.data?.role;
      if (userRole === 'admin' || userRole === 'Admin') {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setLoginError(err.message || "Invalid credentials");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }
    
    if (!role) {
      alert("Please select a role.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      await registerUser({ username, usermail, password, role });
      alert("Registration successful! Please log in.");
      resetForm();
      toggleAuthMode();
    } catch (err) {
      alert(err.message || "Registration failed");
    }
  };

  const resetForm = () => {
    setUsername("");
    setUsermail("");
    setRole("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setAgreeToTerms(false);
    setRememberMe(false);
  };

  const toggleAuthMode = () => {
    setTransitionClass("slide-out");
    setTimeout(() => {
      setIsLogin(!isLogin);
      resetForm();
      setTransitionClass("slide-in");
    }, 300);
  };

  return (
    <div className={`auth-container ${transitionClass}`}>
      <div className="auth-header">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
      </div>
      <form
        className="auth-form"
        onSubmit={isLogin ? handleLogin : handleRegister}
      >
        {isLogin ? (
          <>
            <div className="email-container">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <EmailIcon />
            </div>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <EyeIcon open={showPassword} onClick={() => setShowPassword((v) => !v)} />
            </div>
          </>
        ) : (
          <>
            <div className="input-row">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <input
                type="email"
                placeholder="Usermail"
                value={usermail}
                onChange={(e) => setUsermail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group select-group">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="role-select"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <DownArrowIcon />
            </div>
            <div className="input-row">
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Retype password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="show-password">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword">Show password</label>
            </div>
          </>
        )}
        {isLogin && loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        {isLogin ? (
          <div className="auth-links">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>
        ) : (
          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms of Use</a> and{" "}
              <a href="#">Privacy Policy</a>
            </label>
          </div>
        )}
        <button type="submit" className="auth-button">
          {isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>
      <div className="divider">
        <span>
          {isLogin ? "New to our platform?" : "Already have an account?"}
        </span>
      </div>
      <button className="toggle-auth-button" onClick={toggleAuthMode}>
        {isLogin ? "Create an account" : "Sign in"}
      </button>
    </div>
  );
};

export default AuthForm;
