import React, { useState } from "react";

import { Button, Modal } from "antd";
import { DeleteOutlined, DownCircleOutlined, ImportOutlined, RedoOutlined, UpCircleOutlined } from "@ant-design/icons";

export default function SettingsModal({settingsHelper, itemCoreDisplay, itemDetailedDisplay, itemImportDisplay, modalOpen, setModalOpen, title, network, setTargetNetwork }) {
    const [itemDetailed, setItemDetailed] = useState(undefined);
    const [importView, setImportView] = useState(false);

    return (
        <Modal
            visible={modalOpen}
            title={<Title title={title} network={network}/>}
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
            <div style={{ fontSize:"2em"}}>
                {importView && itemImportDisplay && itemImportDisplay(settingsHelper, itemCoreDisplay, itemDetailedDisplay, network, setImportView)}

                {!importView && 
                    (
                        itemDetailed ?
                            itemDetailedDisplay(settingsHelper, itemDetailed, itemCoreDisplay, network, setItemDetailed, setTargetNetwork)
                        :
                            <div>
                                <ItemsDisplay settingsHelper={settingsHelper} itemCoreDisplay={itemCoreDisplay} itemDetailedDisplay={itemDetailedDisplay} setItemDetailed={setItemDetailed}/>

                                <RemovedItemDisplay settingsHelper={settingsHelper} itemCoreDisplay={itemCoreDisplay}/>

                                <Buttons settingsHelper={settingsHelper} itemImportDisplay={itemImportDisplay} setImportView={setImportView}/>
                            </div>
                    )
                }

                {(importView || itemDetailed) &&
                    <div style={{ display: "flex", alignItems:"center", justifyContent: "center", marginTop: "2em"}}>
                        <Button
                            key="cancel"
                            onClick={() => {
                                setImportView(false);
                                setItemDetailed(undefined);
                            }}
                        >
                        <span style={{ marginRight: 8 }}>⏪</span>Cancel
                      </Button>
                    </div>
                }
            </div>
        </Modal>
    );
}

const ItemDisplay = ({ item, itemCoreDisplay, onClick, isCurrentlySelected, width = "" }) => {
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
                    {itemCoreDisplay(item)}
                </span>
            </div>
        </div>
    );
};

const ItemsDisplay = ({settingsHelper, itemCoreDisplay, itemDetailedDisplay, setItemDetailed}) => {
    return (
        <>
            {settingsHelper.sortedItems.map((item, index) => (
                        <div key={index}>
                            <ItemWithButtons
                                item={item}
                                itemCoreDisplay={itemCoreDisplay}
                                itemDetailedDisplay={itemDetailedDisplay}
                                setItemDetailed={setItemDetailed}
                                settingsHelper={settingsHelper}
                            />
                        </div>
                    ))}
        </>
    );
};

const ItemWithButtons = ({item, itemCoreDisplay, itemDetailedDisplay, setItemDetailed, settingsHelper}) => {
    const sortedItems = settingsHelper.sortedItems;
    const selectedItem = settingsHelper.getSelectedItem();

    const itemIndex = sortedItems.indexOf(item);
    const isItemFirst = (itemIndex == 0);
    const isItemLast = (itemIndex == (sortedItems.length -1));
    const isOnlyOneItem = (sortedItems.length == 1);

    const isCurrentlySelected = selectedItem ? (selectedItem.name == item.name) : (itemIndex == 0);

    const isItemDetailedDisplay = itemDetailedDisplay && ((item?.name !== "localhost") && (item?.name !== "buidlguidl"));

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
                    itemCoreDisplay={itemCoreDisplay}
                    onClick={isItemDetailedDisplay ? () => setItemDetailed(item) : undefined}
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

const RemovedItemDisplay = ({settingsHelper, itemCoreDisplay}) => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", paddingTop:"2em", paddingBottom:"2em"}}>
        {settingsHelper.removedItems.map((item, index) => (
            <div key={index} style={{flexBasis: "30%", padding:"0.25em"}}>
                <ItemDisplay
                    item={item}
                    itemCoreDisplay={itemCoreDisplay}
                    onClick={() => settingsHelper.addItem(item)}
                />
            </div>
        ))}
    </div>
);

const Buttons = ({ settingsHelper, itemImportDisplay, setImportView }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: itemImportDisplay ? "space-around" : "center"}}>
        {itemImportDisplay && <ImportButton itemImportDisplay={itemImportDisplay} setImportView={setImportView}/>}

        <ResetButton settingsHelper={settingsHelper}/>
    </div>
);

const ImportButton =({ itemImportDisplay, setImportView }) => (
    <Button
        key="import"
        icon={<ImportOutlined />}
        onClick={() => {setImportView(true)}}
    >
        Import
    </Button>
);

const ResetButton =({ settingsHelper }) => (
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
);

const Title =({ title, network }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent:"flex-start"}}>
        <div>
            {title}
        </div>
        &nbsp;
        {
            network && 
                <div style={{ color: network.color}}>
                    {network.name}
                </div>
        }
    </div>
);
