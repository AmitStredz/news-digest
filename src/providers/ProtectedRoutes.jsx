// import { useAuthenticationStatus } from "@nhost/react";
// import { Spinner } from "react-bootstrap";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuthenticationStatus();

//   if (isLoading) {
//     return (
//       <div>
//         <Spinner/>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// };

// export default ProtectedRoute;
