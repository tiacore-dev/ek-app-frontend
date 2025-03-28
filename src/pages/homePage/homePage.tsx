import React, { useEffect, useMemo } from "react";
import { Typography, Row, Col } from "antd";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";

export const HomePage: React.FC = () => {
  const dispatch = useDispatch();

  const breadcrumbs = useMemo(() => [{ label: " ", to: "/home" }], []);

  useEffect(() => {
    dispatch(setBreadcrumbs(breadcrumbs));
  }, [dispatch, breadcrumbs]);

  return (
    <Row justify="center" align="middle" style={{ minHeight: "80vh" }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Typography.Title
          level={1}
          style={{
            textAlign: "center",
            marginBottom: 0,
          }}
        >
          Вы успешно авторизовались!
        </Typography.Title>
      </Col>
    </Row>
  );
};
