import React from "react";

import { Button, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";

export default function PasteButton({ setState }) {
	return (
		<Tooltip title="Paste">
         	<Button
         		icon={<CopyOutlined />} 
         		onClick={ async () => {	
					try {
						const text = await navigator.clipboard.readText();
						setState(text);
					}
					catch (err) {
						console.error('Failed to read clipboard:', err);
					}
				}}
         	/>
        </Tooltip>
	);
};