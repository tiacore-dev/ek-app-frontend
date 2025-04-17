import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Breadcrumb } from "antd";

export const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useSelector(
    (state: RootState) => state.breadcrumbs.paths
  );

  const items = breadcrumbs.map((path, index) => {
    const isLast = index === breadcrumbs.length - 1 || !path.to;

    return {
      title: isLast ? path.label : <Link to={path.to!}>{path.label}</Link>,
    };
  });

  return (
    <Breadcrumb
      style={{
        margin: "1%",
        marginBottom: "0",
      }}
      items={items}
    />
  );
};
