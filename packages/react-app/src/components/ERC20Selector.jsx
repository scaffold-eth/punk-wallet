import React from "react";

import { Select } from "antd";

export const tokenDisplay = (name, imgSrc) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
        <img style={{ height: "1em", width: "1em" }} src={imgSrc} />
        {name}
    </div>
);

export default function ERC20Selector({token, setTokenName, targetNetwork}) {
    const tokenOption = (name, value, imgSrc) => (
        <Select.Option key={name} value={value} style={{lineHeight:2, fontSize:24}}>
            {tokenDisplay(name, imgSrc)}
        </Select.Option>
    );

    const DEFAULT_VALUE = "";
    
    const options = [];

    options.push(tokenOption(targetNetwork.nativeToken.name, DEFAULT_VALUE, targetNetwork.nativeToken.imgSrc));

    for (const erc20Token of targetNetwork.erc20Tokens) {
        options.push(tokenOption(erc20Token.name, erc20Token.name, erc20Token.imgSrc));
    }

    return (
        <div>
            <Select
                size="large"
                defaultValue={token ? token.name : DEFAULT_VALUE}
                style={{ width: 170, fontSize: 24 }}
                listHeight={1024}
                onChange={value => {setTokenName(value);}}
            >
                {options}
            </Select>
        </div>
    );
}
