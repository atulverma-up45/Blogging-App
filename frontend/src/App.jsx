import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notification from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blog_id" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<SideNav />}>
           
            <Route
              path="blogs"
              element={<ManageBlogs /> }
            />
   
            <Route
              path="notifications"
              element={<Notification />}
            />
          </Route>
          <Route path="settings" element={<SideNav />}>
            <Route
              path="edit-profile"
              element={<EditProfile/>}
            />
            <Route
              path="change-password"
              element={<ChangePassword/>}
            />
          </Route>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<SearchPage />} />
          <Route path="user/:id" element={<ProfilePage />} />
          <Route path="blog/:blog_id" element={<BlogPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
