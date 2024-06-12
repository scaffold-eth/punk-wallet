import React from "react";
import { Modal } from "antd";

const showModal = (error) => {
  const popUp = () => {
    const title = "Coudn't parse the payment link/QR code!";

    Modal.confirm({
      width: "90%",
      title: title,
      maskClosable: true,
      cancelButtonProps: { style: { display: "none" } },
      content: <div>{error}</div>,
    });
  };

  return popUp();
};

export default showModal;
