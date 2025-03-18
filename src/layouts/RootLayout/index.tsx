import { NavLink, Outlet } from "react-router";
import dashboardSrc from "@/assets/icons/dashboard.svg";
const NavigationItem = () => {
  return (
    <NavLink
      to="/"
      className={({ isActive }) =>
        `${isActive ? "bg-surface-secondary" : "normal-link"} flex gap-x-2 p-4 items-center rounded-2xl`
      }
    >
      <img src={dashboardSrc} alt="Dashboard" className="h-6" />
      <p> Dashboard</p>
    </NavLink>
  );
};
const Navbar = () => {
  return (
    <nav>
      <NavigationItem />
    </nav>
  );
};
export default function RootLayout() {
  return (
    <div className="flex flex-col gap-4">
      <section className="p-4">
        <div className="flex gap-2 h-10  items-center">
          <img src="/time.svg" alt="Icon" width={40} />
          <p className="font-semibold text-3xl">Market Times</p>
        </div>
      </section>
      <div className="flex gap-x-4">
        <section className="p-4 grow-1">
          <Navbar />
        </section>
        <section className="grow-12 p-4 ">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
