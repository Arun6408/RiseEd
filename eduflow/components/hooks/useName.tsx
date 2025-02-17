import { useEffect, useState } from "react";

const useNameOfUser = () => {
  const [name, setName] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setName(JSON.parse(localStorage.getItem("user") || "{}").name);
    }
  }, []);
  return {name};
};

export default useNameOfUser;