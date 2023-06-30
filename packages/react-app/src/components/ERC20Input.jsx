import React from "react";

import { Input } from "antd";

import { tokenDisplay } from "./ERC20Selector";

export default function ERC20Input({token, amount, setAmount}) {
  return (
    <div>
      <Input
        value={amount}
        placeholder={"amount in " + token.name}
        addonAfter={tokenDisplay(token.name, token.imgSrc)}
        onChange={async e => {
          setAmount(e.target.value);
        }}
      />
    </div>
  );
}
