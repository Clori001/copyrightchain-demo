import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminGate } from "./components/AdminGate";
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
          <Route
            path="/admin/deploy"
            element={
              <AdminGate>
                <Suspense fallback={<main className="page-shell">Loading admin...</main>}>
                  <Deploy />
                </Suspense>
              </AdminGate>
            }
          />
          <Route
            path="/admin/review"
            element={
              <AdminGate>
                <Suspense fallback={<main className="page-shell">Loading admin...</main>}>
                  <Review />
                </Suspense>
              </AdminGate>
            }
          />
          <Route
            path="/admin"
            element={
              <Navigate to="/admin/review" replace />
            }
          />
          <Route path="/transaction/:hash" element={<Transaction />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
