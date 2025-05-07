import { Button, Modal, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postManifestLoading,
  postManifestUploading,
} from "../../../../api/shiftsApi";
import { Link } from "react-router-dom";

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
  const canUnload = status === "Манифест в пути"; // Изменили условие - теперь только при точном совпадении

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
    if ((type === "recipient" && !canUnload) || mutation.isPending) return;
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

  // Определяем класс и стиль кнопки в зависимости от типа и статуса
  const getButtonProps = () => {
    if (type === "sender") {
      return {
        className: "manifest-action-button-load",
        disabled: !canLoad || mutation.isPending,
      };
    } else {
      return {
        className: canUnload
          ? "manifest-action-button-unload"
          : "manifest-action-button-disabled",
        disabled: !canUnload || mutation.isPending,
      };
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {type === "sender" && (
        <>
          {/* <Button
            size="small"
            onClick={showModal}
            {...getButtonProps()}
            style={{ marginBottom: 8 }}
          >
            Загружено
          </Button> */}
          <Link to={`/scan-parcels/${manifestId}`}>
            <Button type="default" size="small" {...getButtonProps()}>
              Загрузить
            </Button>
          </Link>
        </>
      )}
      {type === "recipient" && (
        <Button size="small" onClick={showModal} {...getButtonProps()}>
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
