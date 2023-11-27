import React, { useState } from "react";

import { Button, Modal } from "antd";
import { DeleteOutlined, DownCircleOutlined, RedoOutlined, UpCircleOutlined } from "@ant-design/icons";

import { TokenDisplay } from "./";

export default function SettingsModal({settingsHelper, modalOpen, setModalOpen, title }) {
    return (
        <Modal
            visible={modalOpen}
            title={title}
            onOk={() => {
                setModalOpen(false);
            }}
            onCancel={() => {
                setModalOpen(false);
            }}
            footer={[
                <Button
                    key="submit"
                    type="primary"
                    loading={false}
                    onClick={() => {
                        setModalOpen(false);
                    }}
                >
                    OK
                </Button>,
            ]}
        >
            <div style={{ fontSize:"2em"}} >
                <ItemsDisplay settingsHelper={settingsHelper}/>

                <RemovedItemDisplay settingsHelper={settingsHelper}/>

                <ResetButton settingsHelper={settingsHelper}/>
            </div>
        </Modal>
    );
}

const ItemDisplay = ({ item, onClick, isCurrentlySelected, width = "" }) => {
    return (
        <div style={{ width: width  }}>
            <div
                style={{
                    cursor: onClick ? "pointer" : "",
                    display: "flex",
                    justifyContent: "center",
                }}
                onClick={onClick ? onClick : () => {}}
            >
                <span style={{...(isCurrentlySelected && {border: "1px solid black", borderRadius: "40%", padding: "0.2em", backgroundColor: "ghostwhite"})}}>
                    <TokenDisplay
                        token={item}
                        divStyle={{display: "flex", alignItems: "center", justifyContent: "center"}}
                        spanStyle={{paddingLeft:"0.2em"}}
                    />
                </span>
            </div>
        </div>
    );
};

const ItemsDisplay = ({settingsHelper}) => {
    return (
        <>
            {settingsHelper.sortedItems.map((item, index) => (
                        <div key={index}>
                            <ItemWithButtons
                                item={item}
                                settingsHelper={settingsHelper}
                            />
                        </div>
                    ))}
        </>
    );
};

const ItemWithButtons = ({item, settingsHelper}) => {
    const sortedItems = settingsHelper.sortedItems;
    const selectedItem = settingsHelper.getSelectedItem();

    const itemIndex = sortedItems.indexOf(item);
    const isItemFirst = (itemIndex == 0);
    const isItemLast = (itemIndex == (sortedItems.length -1));
    const isOnlyOneItem = (sortedItems.length == 1);

    const isCurrentlySelected = selectedItem ? (selectedItem.name == item.name) : (itemIndex == 0);

    return (
        <div style={{ display: "flex", alignItems: "center"}}>
            <div style={{ flexGrow:3, display: "flex", justifyContent: "space-around", alignItems:"center", padding:"0.25em"}}>

                <SettingButton 
                    icon={<DownCircleOutlined />}
                    disabled={isItemLast}
                    onClick={() => settingsHelper.updateIndexMap(item, true)}
                />

                <ItemDisplay
                    item={item}
                    isCurrentlySelected={isCurrentlySelected}
                    width={"7em"} // ToDo: There should be a better way to align the buttons
                />

                <SettingButton 
                    icon={<UpCircleOutlined />}
                    disabled={isItemFirst}
                    onClick={() => settingsHelper.updateIndexMap(item, false)}
                />
            </div>

            <div style={{ flexGrow:1, display: "flex", justifyContent: "space-around" }} >
                <SettingButton 
                    icon={<DeleteOutlined />}
                    disabled={isOnlyOneItem || isCurrentlySelected}
                    onClick={() => settingsHelper.removeItem(item)}
                />
            </div>
        </div>
    );
};

const SettingButton = ({icon, disabled, onClick}) => (
    <div 
        style={disabled ? {color:"ghostwhite"} : {cursor:"pointer"}}
        onClick={!disabled ? onClick : undefined}
    >
        {icon}
    </div>
);

const RemovedItemDisplay = ({settingsHelper}) => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", paddingTop:"2em", paddingBottom:"2em"}}>
        {settingsHelper.removedItems.map((item, index) => (
            <div key={index} style={{flexBasis: "30%", padding:"0.25em"}}>
                <ItemDisplay
                    item={item}
                    onClick={() => settingsHelper.addItem(item)}
                />
            </div>
        ))}
    </div>
);

const ResetButton =({settingsHelper}) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent:"center"}}>
        <Button
            key="reset"
            icon={<RedoOutlined />}
            disabled={!settingsHelper.isModalSettingsModified()}
            onClick={() => {
                settingsHelper.resetModalSettings();
            }}
        >
            Reset Settings
        </Button>
    </div>
);