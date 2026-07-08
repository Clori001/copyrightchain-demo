import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Certificate } from "./pages/Certificate";
import { Explorer } from "./pages/Explorer";
import { Home } from "./pages/Home";
import { MyWorks } from "./pages/MyWorks";
import { Register } from "./pages/Register";
import { Transaction } from "./pages/Transaction";
import { Verify } from "./pages/Verify";

const Deploy = lazy(() => import("./pages/Deploy").then((module) => ({ default: module.Deploy })));
const Review = lazy(() => import("./pages/Review").then((module) => ({ default: module.Review })));
const ENABLE_ADMIN = import.meta.env.VITE_ENABLE_ADMIN === "true";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/my-works" element={<MyWorks />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:id" element={<Verify />} />
          <Route path="/explorer" element={<Explorer />} />
          {ENABLE_ADMIN ? (
            <>
              <Route
                path="/admin/deploy"
                element={
                  <Suspense fallback={<main className="page-shell">Loading admin...</main>}>
                    <Deploy />
                  </Suspense>
                }
              />
              <Route
                path="/admin/review"
                element={
                  <Suspense fallback={<main className="page-shell">Loading admin...</main>}>
                    <Review />
                  </Suspense>
                }
              />
            </>
          ) : null}
          <Route path="/transaction/:hash" element={<Transaction />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
