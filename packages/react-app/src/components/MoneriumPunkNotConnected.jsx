import React, { useState } from "react";

import { Button} from "antd";
import { ExportOutlined } from "@ant-design/icons";

import { linkAddress, getShortAddress } from "../helpers/MoneriumHelper";

export default function MoneriumPunkNotConnected( { moneriumClient, currentPunkAddress, initClientData } ) {
    const [linkButtonLoading, setLinkButtonLoading] = useState(false);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ padding: '1em', fontSize: '1.2em' }}>
                Your current Punk Wallet <b>{getShortAddress(currentPunkAddress)}</b> is not linked to your Monerium account.
            </div>
            <div>
                <Button
                    key="submit"
                    type="primary"
                    loading={linkButtonLoading}
                    icon={<ExportOutlined />}
                    onClick={async () => {
                        setLinkButtonLoading(true);
                        await linkAddress(moneriumClient, currentPunkAddress);
                        await initClientData();
                        setLinkButtonLoading(false);
                    }}
                >
                    Link Punk Wallet
                </Button>
            </div>
        </div>
    );
}