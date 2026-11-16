import { Link, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth";
import Portfolio from "./components/Portfolio";
import CaseStudy from "./pages/CaseStudy";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
import DemoPage from "./pages/Demo";
import VerifyPage from "./pages/Verify";
import InquiryPage from "./pages/Inquiry";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<Portfolio standalone />} />
          <Route path="portfolio/:slug" element={<CaseStudy />} />
          <Route path="belepes" element={<AuthPage key="login" />} />
          <Route
            path="regisztracio"
            element={<AuthPage key="register" register />}
          />
          <Route path="megerosites/:user/:hash" element={<VerifyPage />} />
          <Route path="demo" element={<DemoPage />} />
          <Route path="ajanlat" element={<InquiryPage />} />
          <Route
            path="*"
            element={
              <section className="section">
                <div className="container">
                  <p className="eyebrow">404 / EZ AZ OLDAL NINCS ITT</p>
                  <h1>Keressünk másik irányt.</h1>
                  <Link className="button dark" to="/">
                    Vissza a főoldalra ↗
                  </Link>
                </div>
              </section>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
