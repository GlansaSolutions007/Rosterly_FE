import './App.css'
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Login from './Screens/Login';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './Component/SideBar';
import Rosterly from './Screens/Rosterly';
import Unavailability from './Screens/Unavailability';
import NavBar from './Component/NavBar';
import Dashboard from './Screens/Dashboard';
import Register from './Screens/Register';
import People from './Screens/People';
import Location from './Screens/Location';
import SystemSettings from './Screens/RosterSettings/SystemSettings';
import PayRate from './Screens/RosterSettings/PayRate';
import Utilities from './Screens/Utilities';
import Rosters from './Screens/Rosters';
import TimeSheet from './Screens/TimeSheet';
import Notification from './Screens/Notification';
import General from './Screens/RosterSettings/General';
import RosterSetting from './Screens/RosterSettings/RosterSetting';
import EmployeeTypeLoading from './Screens/RosterSettings/EmployeeTypeLoading';
import Permission from './Screens/RosterSettings/Permission';
import JuniorRate from './Screens/RosterSettings/JuniorRate';
import PenalityRate from './Screens/RosterSettings/PenalityRate';
import Profile from './Screens/Profile';
import ClickSpark from './Component/ClickSpark';
import ShiftBoard from './Screens/ShiftBoard';
import NotFound from './Component/NotFound';
import ProtectedRoutes from './Component/ProtectedRoutes';
import Forbidden from './Component/Forbidden';
import ChangePassword from './Screens/ChangePassword';


function AppWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true); // expanded view for desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLoginPage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';

  const isNotFound = ![
    '/',
    '/register',
    '/dashboard',
    '/myrosterly',
    '/unavailability',
    '/employee',
    '/location',
    '/systemsettings',
    '/payrate',
    '/utilities',
    '/roster',
    '/timesheet',
    '/notification',
    '/generalsettings',
    '/rostersetting',
    '/employeetypeloading',
    '/permission',
    '/JuniorRate',
    '/PanalityRate',
    '/profile',
    '/drag',
    '/changepassword',
  ].includes(location.pathname);

  const role_id = localStorage.getItem("role_id");
  const userRole = role_id ? parseInt(role_id, 10) : null;

   if (!userRole && !['/', '/register'].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <ClickSpark
        sparkColor='#111111'
        sparkSize={8}
        sparkRadius={15}
        sparkCount={5}
        duration={400}
      >
        <div className='flex h-screen overflow-hidden'>
          {!isLoginPage && !isRegisterPage && !isNotFound && (

            <div className=" top-0 left-0 h-full">
              {(sidebarOpen || !isMobile) && (
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isMobile={isMobile} />
              )}
            </div>
          )}
          <div className='flex-1 flex flex-col'>
            {!isLoginPage && !isRegisterPage && !isNotFound && <NavBar toggleSidebar={toggleSidebar} />}
            <div className={`flex-1 overflow-auto ${isLoginPage || isRegisterPage ? 'p-0' : 'px-4'} ${isNotFound ? 'flex items-center p-12 justify-center' : ''}`}>
              <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/myrosterly/*'
                  element={
                    <ProtectedRoutes
                      element={<Rosterly />}
                      allowedRoles={[1, 2, 3]}
                      userRole={userRole}
                    />
                  }
                />
                <Route path='/unavailability'
                  element={
                    <ProtectedRoutes
                      element={<Unavailability />}
                      allowedRoles={[2, 3]}
                      userRole={userRole}
                    />
                  } />
                <Route path='/employee'
                  element={
                    <ProtectedRoutes
                      element={<People />}
                      allowedRoles={[1, 2]}
                      userRole={userRole}
                    />
                  } />
                <Route
                  path="/location"
                  element={
                    <ProtectedRoutes
                      element={<Location />}
                      allowedRoles={[1, 2]}
                      userRole={userRole}
                    />
                  }
                />
                <Route
                  path="/systemsettings"
                  element={
                    <ProtectedRoutes
                      element={<SystemSettings />}
                      allowedRoles={[1]}
                      userRole={userRole}
                    />
                  }
                />
                <Route path='/payrate' element={<PayRate />} />
                <Route path='/utilities' element={<Utilities />} />
                <Route path='/roster'
                  element={
                    <ProtectedRoutes
                      element={<Rosters />}
                      allowedRoles={[1, 2]}
                      userRole={userRole}
                    />
                  } />
                <Route path='/timesheet'
                  element={
                    <ProtectedRoutes
                      element={<TimeSheet />}
                      allowedRoles={[1, 2]}
                      userRole={userRole}
                    />
                  } />
                <Route path='/notification' element={<Notification />} />
                <Route path='/generalsettings' element={<General />} />
                <Route path='/rostersetting' element={<RosterSetting />} />
                <Route path='/employeetypeloading' element={<EmployeeTypeLoading />} />
                <Route path='/permission' element={<Permission />} />
                <Route path='/JuniorRate' element={<JuniorRate />} />
                <Route path='/PanalityRate' element={<PenalityRate />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/drag' element={<ShiftBoard />} />
                <Route path='/changepassword' element={<ChangePassword />} />
                <Route
                  path='*'
                  element={
                    <NotFound baseIntensity={0.2} hoverIntensity={0.5} enableHover={true}>
                      {"404\nnot found"}
                    </NotFound>
                  }
                />
                <Route path='/forbidden' element={<Forbidden />} />
              </Routes>
            </div>
          </div>
        </div>
      </ClickSpark>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}