import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";

export const WarehouseShipPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Склад", to: undefined }, // или просто { label: "Склад" }
        { label: "Выгрузить со склад", to: "/warehouse/ship" },
      ])
    );
  }, [dispatch]);

  return <h1 style={{ fontSize: "1.8rem", marginBottom: "30px" }}>shipPage</h1>;
};
