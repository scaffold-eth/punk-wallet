import React, { useEffect, useState } from "react";

import { Select } from "antd";
import { SettingOutlined } from "@ant-design/icons";

export default function SelectorWithSettings({settingsHelper, itemCoreDisplay, settingsModalOpen, onChange, optionStyle}) {
    const selectedItem = settingsHelper.getSelectedItem();
    const selectedItemName = selectedItem ? selectedItem.name : settingsHelper.items[0].name;

    const [currentValue, setCurrentValue] = useState(selectedItemName);

    useEffect(() => {
        // This is only needed once, after migrating an old storage key
        if (selectedItem && (selectedItem.name != currentValue)) {
            setCurrentValue(selectedItem.name);
        }
    }, [selectedItem]);
    
    const options = settingsHelper.sortedItems.map(
        (item) => option(item, itemCoreDisplay, optionStyle)
    );

    options.push(
        option({name:SETTINGS_NAME}, settingsOption, {fontSize:32})
    );

    return (
        <div>
            <Select
                size="large"
                defaultValue={currentValue}
                style={{ width: 170, fontSize: 24 }}
                listHeight={1024}
                onChange={(value) => {
                    if (value == SETTINGS_NAME) {
                        settingsModalOpen(true);
                    }
                    else {
                        setCurrentValue(value);
                        settingsHelper.updateSelectedName(value);
                        onChange && onChange(value);
                    }
                }}
                value={currentValue}
            >
                {options}
            </Select>
        </div>
    );
}

const option = (item, itemCoreDisplay, style) => (
    <Select.Option key={item.name} value={item.name} style={{lineHeight:2, fontSize:24, ...style}}>
        {itemCoreDisplay(item)}
    </Select.Option>
);

const SETTINGS_NAME = "SettingsName";
const settingsOption = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
        <SettingOutlined />
    </div>
);