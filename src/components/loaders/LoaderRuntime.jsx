import { useEffect } from "react";
import { bindApiLoader } from "../../api/client";
import { useLoader } from "../../hooks/useLoader";
import TopProgressBar from "./TopProgressBar";

const LoaderRuntime = () => {
  const { increment, decrement } = useLoader();

  useEffect(() => {
    bindApiLoader({ increment, decrement });
    return () => bindApiLoader(null);
  }, [increment, decrement]);

  return (
    <>
      <TopProgressBar />
    </>
  );
};

export default LoaderRuntime;
