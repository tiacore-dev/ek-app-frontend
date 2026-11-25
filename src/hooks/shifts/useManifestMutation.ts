// src/hooks/manifests/useManifestMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postManifestLoading,
  postManifestUploading,
} from "../../api/shiftsApi";
import type { IManifestLoadingRequest } from "../../types/shifts";
import { message } from "antd";

export const useManifestMutation = ({
  type,
  manifestId,
}: {
  type: "sender" | "recipient";
  manifestId: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IManifestLoadingRequest) =>
      type === "sender"
        ? postManifestLoading(manifestId, data)
        : postManifestUploading(manifestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift"] });
      message.success(
        type === "sender" ? "Успешно загружено" : "Успешно выгружено"
      );
    },
    onError: (error) => {
      console.error("Ошибка:", error);
      message.error("Произошла ошибка при выполнении операции");
    },
  });
};
