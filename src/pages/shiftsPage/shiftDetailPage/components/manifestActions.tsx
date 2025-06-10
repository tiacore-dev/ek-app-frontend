import { Button, Modal, Form, Input, message, Typography } from "antd";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postManifestLoading,
  postManifestUploading,
} from "../../../../api/shiftsApi";
import { Link } from "react-router-dom";
import ManifestStorage from "../../manifests/manifestStorage";

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
  const canUnload = status === "Манифест в пути";

  // Получаем данные о сканировании для этого манифеста
  const scannedItems = ManifestStorage.getScannedItems(manifestId);
  const scannedCount = Object.values(scannedItems).reduce(
    (sum, items) => sum + items.length,
    0
  );

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

  const renderScanProgress = () => {
    if (type !== "sender") return null;

    return (
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginTop: 4 }}
      >
        Отсканировано: {scannedCount}
      </Typography.Text>
    );
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {type === "sender" && (
        <>
          <Link to={`/scan-parcels/${manifestId}`}>
            <Button type="default" size="small" {...getButtonProps()}>
              Загрузить
            </Button>
          </Link>
          {renderScanProgress()}
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
