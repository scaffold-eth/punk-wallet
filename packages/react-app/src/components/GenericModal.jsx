import { Button } from "antd";
import React from "react";
import { createPortal, render } from "react-dom";

const showModal = (error, isError) => {
  console.error(error);

  const closeModal = () => {
    const modalElement = document.getElementById("errorModal");
    document.body.removeChild(modalElement);
  };

  return render(
    createPortal(
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          display: "flex",
          gap: "2rem",
          flexDirection: "column",
          height: "auto",
          width: "80vw",
          position: "absolute",
          zIndex: "999",
          top: "50%",
          left: "50%",
          backgroundColor: "#fff",
          border: `4px solid ${isError ? "#ffbdbd" : "#ffefbd"}`,
          borderRadius: "4px",
          transform: "translate(-50%, -50%)",
        }}
        id="errorModal"
      >
        <span onClick={closeModal} style={{ padding: "1rem", cursor: "pointer" }} className="ant-modal-close">
          X
        </span>
        <span>Something went wrong:</span>
        {error}
        <Button
          onClick={closeModal}
          style={{ cursor: "pointer", color: isError ? "red" : "yellow" }}
          className="ant-btn-default"
        >
          OK
        </Button>
      </div>,
      document.body,
    ),
    document.createElement("div"),
  );
};

export default showModal;
