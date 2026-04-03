import { useContext } from "react";
import { LoaderContext } from "../context/LoaderContext";

export const useLoader = () => {
  const value = useContext(LoaderContext);

  if (!value) {
    throw new Error("useLoader must be used within LoaderProvider");
  }

  return value;
};

export default useLoader;
