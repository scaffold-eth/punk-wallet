import React, { useState, useEffect } from "react";

import { BulbOutlined, BulbFilled } from "@ant-design/icons";

export default function DarkMode({ }) {
  const [isDark, setIsDark] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDark));
    if (isDark) {
      document.body.style.backgroundColor = "#333333"; // A nice dark gray for dark mode
    } else {
      document.body.style.backgroundColor = "white"; // Default white for light mode
    }
  }, [isDark]);

  // On initial render, apply the saved mode immediately
  useEffect(() => {
    if (isDark) {
      document.body.style.backgroundColor = "#333333";
    } else {
      document.body.style.backgroundColor = "white";
    }
  }, []); // Empty dependency array to run only once on mount

  return (
    <span
      style={{
        color: "#1890ff",
        cursor: "pointer",
        fontSize: 30,
        paddingLeft: 16,
        verticalAlign: "middle",
      }}
      onClick={() => {
        setIsDark((prev) => !prev);
      }}
    >
      {isDark ? <BulbFilled /> : <BulbOutlined />}
    </span>
  );
}