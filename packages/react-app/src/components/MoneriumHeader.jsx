import React from "react";

import { Button } from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";

import { LogoOnLogo } from "./";

import { getNewMoneriumClient, getAuthFlowURI, cleanStorage} from "../helpers/MoneriumHelper";

export default function MoneriumHeader( { moneriumConnected, setMoneriumConnected, setPunkConnectedToMonerium, setMoneriumClient, setClientData} ) {
	const disconnectClient = () => {
        cleanStorage();

        setMoneriumConnected(false);
        setPunkConnectedToMonerium(false);
        setClientData(null);

        setMoneriumClient(getNewMoneriumClient());
    }

	return (
        <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
            <div
                style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                onClick={() => window.open('https://monerium.com/', '_blank')}>

                <LogoOnLogo
                    src1={"MoneriumLogo.png"}
                    src2={"greenCheckmark.svg"}
                    sizeMultiplier1={2}
                    showImage2={moneriumConnected}
                />

                <div style={{ fontWeight: 'bold' }}>
                    MONERIUM
                </div>

                <img
                    src="/open_in_new.svg"
                    alt="open_in_new.svg"
                />
            </div>
            
            <div>
				<Button
					type="primary"
					shape="round"
					icon={moneriumConnected ? <LogoutOutlined /> : <LoginOutlined />}
					size={'large'}
					onClick={
						() => {
							moneriumConnected ? disconnectClient() : getAuthFlowURI();
						}
					}
				>
					{moneriumConnected ? "Disconnect" : "Connect"}
				</Button>
            </div>
        </div>
    );
}