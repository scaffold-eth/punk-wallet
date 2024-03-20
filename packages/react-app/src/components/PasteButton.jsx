import React from "react";

import { Button, Tooltip } from "antd";
import { SnippetsOutlined } from "@ant-design/icons";

export default function PasteButton({ setState, disabled }) {
	return (
		<Tooltip title="Paste">
			<Button
				icon={<SnippetsOutlined />}
				onClick={async () => {
					try {
						const text = await navigator.clipboard.readText();
						setState(text);
					} catch (err) {
						console.error("Failed to read clipboard:", err);
					}
				}}
				disabled={disabled}
			/>
		</Tooltip>
	);
}
