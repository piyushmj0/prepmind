import {createBrowserRouter} from "react-router-dom";
import { Login } from "./features/auth/pages/login";
import { Register } from "./features/auth/pages/register";
import Protected from "./features/auth/components/protected";

import { Dashboard } from "./features/ai/pages/dashboard";
import { Landing } from "./features/landing/pages/Landing";
import { EditProfile } from "./features/profile/pages/EditProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element: <Protected><Dashboard /></Protected>
  },
  {
    path: "/profile",
    element: <Protected><EditProfile /></Protected>
  }
])
