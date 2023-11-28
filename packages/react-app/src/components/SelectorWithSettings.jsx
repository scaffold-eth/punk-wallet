import React, { useEffect, useState } from "react";

import { Select } from "antd";
import { SettingOutlined } from "@ant-design/icons";

import { TokenDisplay } from "./";

export default function SelectorWithSettings({tokenSettingsHelper, setTokenSettingsModalOpen}) {
    const selectedToken = tokenSettingsHelper.getSelectedItem();

    const selectedTokenName = selectedToken ? selectedToken.name : tokenSettingsHelper.items[0].name;
    const [currentValue, setCurrentValue] = useState(selectedTokenName);

    useEffect(() => {
        // This is only needed once, when migrateSelectedTokenStorageSetting is used
        if (selectedToken && (selectedToken.name != currentValue)) {
            setCurrentValue(selectedToken.name);
        }
    }, [selectedToken]);
    
    const options = tokenSettingsHelper.sortedItems.map(
        (token) => tokenOption(token)
    );

    options.push(tokenSettingsOption());

    return (
        <div>
            <Select
                size="large"
                defaultValue={currentValue}
                style={{ width: 170, fontSize: 24 }}
                listHeight={1024}
                onChange={(value) => {
                    if (value == TOKEN_SETTINGS_NAME) {
                        setTokenSettingsModalOpen(true);
                    }
                    else {
                        setCurrentValue(value);
                        tokenSettingsHelper.updateSelectedName(value);
                    }
                }}
                value={currentValue}
            >
                {options}
            </Select>
        </div>
    );
}

const tokenOption = (token) => (
    <Select.Option key={token.name} value={token.name} style={{lineHeight:2, fontSize:24}}>
        <TokenDisplay token={token}/>
    </Select.Option>
);

const TOKEN_SETTINGS_NAME = "tokenSettingsName";
const tokenSettingsOption = () => (
    <Select.Option  key={"tokenSettingsKey"} value={TOKEN_SETTINGS_NAME} style={{lineHeight:2, fontSize:32}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
            <SettingOutlined />
        </div>
    </Select.Option>
);
