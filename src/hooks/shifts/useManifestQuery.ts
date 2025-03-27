import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchManifestById } from "../../api/shiftsApi";

export const useManifestQuery = (manifestId: string) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["manifest", manifestId],
    queryFn: async () => {
      try {
        return await fetchManifestById(manifestId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Токен не найден в localStorage"
        ) {
          navigate("/login");
        }
        throw error;
      }
    },
  });
};
