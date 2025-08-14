import React from "react";
import AllEbooksPageComponent from "@/components/pages/Ebooks/AllEbooksPageCompoenent";
import PrincipalLayout from "../PrincipalLayout";

const page = () => {
  return (
    <PrincipalLayout activeLink="/principal/ebooks">
      <AllEbooksPageComponent/>
    </PrincipalLayout>
  );
};

export default page;
