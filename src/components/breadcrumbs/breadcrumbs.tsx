import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Breadcrumb } from "antd"; // Импорт компонента Ant Design

export const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useSelector(
    (state: RootState) => state.breadcrumbs.paths
  );

  return (
    <Breadcrumb
      style={{
        margin: "1%",
        marginBottom: "0",
      }}
    >
      {breadcrumbs.map((path, index) => (
        <Breadcrumb.Item key={index}>
          {index === breadcrumbs.length - 1 ? (
            path.label
          ) : (
            <Link to={path.to}>{path.label}</Link>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};
