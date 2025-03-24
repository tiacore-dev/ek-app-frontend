import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./protectedRoute";

import { LoginPage } from "./pages/loginPage/loginPage";
import { HomePage } from "./pages/homePage/homePage";

// import "./App.css";
import "antd/dist/reset.css"; // Импорт стилей Ant Design

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* <Toaster position="top-right" /> */}

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
