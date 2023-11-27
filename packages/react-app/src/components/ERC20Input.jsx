import React from "react";

import { Input } from "antd";

import { TokenDisplay } from "./";

export default function ERC20Input({token, amount, setAmount}) {
  return (
    <div>
      <Input
        value={amount}
        placeholder={"amount in " + token.name}
        addonAfter={<TokenDisplay token={token}/>}
        onChange={async e => {
          setAmount(e.target.value);
        }}
      />
    </div>
  );
}
