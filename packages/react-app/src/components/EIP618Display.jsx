import React from "react";
import { Modal } from 'antd';

const { confirm } = Modal;

export default function EIP618Display({ parsedObject}) {
  return (
    <pre>
      {JSON.stringify(parsedObject, null, 2)}
    </pre>
  );
}
