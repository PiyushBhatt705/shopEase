import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // AUTO LOGIN
  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // LOGIN
  const login = (email, password) => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      (user) =>
        user.email === email &&
        user.password === password
    );

    if (!foundUser) {
      alert("Invalid email or password");
      return null;
    }

    localStorage.setItem(
      "currentUser",
      JSON.stringify(foundUser)
    );

    setUser(foundUser);

    alert("Login successful!");

    return foundUser;
  };

  // SIGNUP
  const signup = (name, email, password) => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find(
      (user) => user.email === email
    );

    if (existingUser) {
      alert("Email already exists");
      return;
    }

    const newUser = {
      name,
      email,
      password,
    };

    users.push(newUser);

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    alert("Signup successful!");
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    alert("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;