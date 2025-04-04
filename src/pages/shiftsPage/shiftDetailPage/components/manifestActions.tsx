import { Button, Modal, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postManifestLoading,
  postManifestUploading,
} from "../../../../api/shiftsApi";
import { useManifestMutation } from "../../../../hooks/shifts/useManifestMutation";

interface ManifestActionsProps {
  type: "sender" | "recipient";
  status?: string;
  manifestId: string;
}

export const ManifestActions: React.FC<ManifestActionsProps> = ({
  type,
  status,
  manifestId,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const canLoad = !status || status === "Готов к загрузке";
  const canUnload = !status || status === "Манифест в пути";

  const mutation = useMutation({
    mutationFn: (data: { comment?: string }) =>
      type === "sender"
        ? postManifestLoading(manifestId, data)
        : postManifestUploading(manifestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift"] });
      message.success(
        type === "sender" ? "Успешно загружено" : "Успешно выгружено"
      );
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      console.error("Ошибка:", error);
      message.error("Произошла ошибка при выполнении операции");
    },
  });

  const showModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalVisible(true);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      const values = await form.validateFields();
      mutation.mutate({ comment: values.comment });
    } catch (error) {
      console.error("Ошибка валидации:", error);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {type === "sender" && canLoad && (
        <Button
          size="small"
          onClick={showModal}
          className="manifest-action-button"
        >
          Загружено
        </Button>
      )}
      {type === "recipient" && canUnload && (
        <Button
          size="small"
          onClick={showModal}
          className="manifest-action-button"
        >
          Выгружено
        </Button>
      )}

      <Modal
        title={
          type === "sender"
            ? "Подтверждение загрузки"
            : "Подтверждение выгрузки"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={mutation.isPending}
        okText={type === "sender" ? "Загрузить" : "Выгрузить"}
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="comment" label="Комментарий (необязательно)">
            <Input.TextArea
              rows={2}
              placeholder="Введите комментарий..."
              onClick={(e) => e.stopPropagation()}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
