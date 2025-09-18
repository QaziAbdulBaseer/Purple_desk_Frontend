

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './store/store';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './Pages/Home.';
import Login from './Pages/Login';
import Dashboard from './Pages/AdminPages/dashboard';
import AuthLayout from './components/AuthLayout';

// import Home from './Pages/Home.jsx';


// src\Pages\PatientDashboard\PatientDashboard.js

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },

      // {
      //   path: "/login",
      //   element: (
      //     <AuthLayout authentication={false}>
      //       <Login />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/SignUp",
      //   element: (
      //     <AuthLayout authentication={false}>
      //       <SignUpRole />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/SignUpRole",
      //   element: (
      //     <AuthLayout authentication={false}>
      //       <SignUpRole />
      //     </AuthLayout>
      //   ),
      // },
      {
        path: "/dashboard",
        element: (
          <AuthLayout authentication={true} userRole={['admin']}>
            <Dashboard />
          </AuthLayout>
        ),
      },


        // path: "/dashboard",
        // element: (
        //   <AuthLayout authentication={true}>
        //     <Dashboard />
        //   </AuthLayout>
        // ),
      // {
      //   path: "/SignUpDoctor",
      //   element: (
      //     <AuthLayout authentication={false}>
      //       <SignUpDoctor />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/SignUpOTP",
      //   element: (
      //     <AuthLayout authentication={false}>
      //       <SignUpOTPpage />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/patient-profile",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <PatientProfile />
      //     </AuthLayout>
      //   ),
      // },
      // // Role-protected routes
      // {
      //   path: "/patient-dashboard",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <PatientDashboard />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/patient-profile-view",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <PatientProfileView />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/patient-reports",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <PatientReports />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/add-reports-manually",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <AddReportsManually />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/add-reports-auto",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <AddReportsAuto />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/patient-vaccines",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <PatientVaccines />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/add-Vaccines-Manually",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <AddVaccinesManually />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/add-Hospital-Records-Manually",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <AddHospitalManually />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/patient-hospital",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <PatientHospital />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/search-for-doctor",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <SearchForDoctor />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/your-appointments",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <Appointments />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/show-doctor-profile",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <ShowDoctorProfile />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/select-appointments",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <TakeAppointments />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/appointment-form",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <AppointmentsForm />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/patient-my-doctors",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <MyDoctors />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/show-prescription",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <ShowPrescription />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/my-family",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient", "FamilyMember"]}>
      //       <MyFamily />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/share-records",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient"]}>
      //       <ShareRecords />
      //     </AuthLayout>
      //   ),
      // },






      // // AI part 
      // {
      //   path: "/prediction",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient"]}>
      //       <Prediction />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/prediction/heart-prediction",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient"]}>
      //       <HeartPrediction />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/prediction/liver-prediction",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient"]}>
      //       <LiverPrediction />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/prediction/CBC-prediction",
      //   element: (
      //     <AuthLayout authentication={true} userRole={["Patient"]}>
      //       <CBC_Prediction />
      //     </AuthLayout>
      //   ),
      // },



      // // Authentication for doctors 
      // {
      //   path: "/doctor-dashboard",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <DoctorDashboard />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/doctor-profile-view",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <DoctorProfileView />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/doctor-profile",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <DoctorProfile />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/upload-schedule",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <UploadSchedule />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/appointments-display",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <AppointmentsDisplay />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/appointments-form/:patientId/:appointmentId",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <AppointmentForm />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/view-patient-profile/:patientId",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <PatientProfileForDoctor />
      //     </AuthLayout>
      //   ),
      // },
      // {
      //   path: "/view-shared-records-data",
      //   element: (
      //     <AuthLayout authentication={true} userRole="Doctor">
      //       <SharedRecords />
      //     </AuthLayout>
      //   ),
      // },


    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);