import Home from "@/components/Home";
import RootLayout from "@/layouts/RootLayout";
import { BrowserRouter, Route, Routes } from "react-router";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
