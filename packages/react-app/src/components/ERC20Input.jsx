import React, { useState } from "react";

import { Input } from "antd";

import { TokenDisplay } from "./";

export default function ERC20Input({ token, amount, setAmount }) {
  const [mode, setMode] = useState(token.name);

  let addonAfter;
  let prefix;

  const toggleUSDERC20 = () => {
    if (mode === "USD") {
      setMode(token.name);
    } else {
      setMode("USD");
    }
  };

  const switchMode = title => {
    return (
      <div
        onClick={() => {
          toggleUSDERC20();
        }}
      >
        {title}
      </div>
    );
  };

  // <TokenDisplay token={token} />

  if (mode === "USD") {
    prefix = "$";
    addonAfter = switchMode("USD 🔀");
  } else {
    prefix = "Ξ";
    addonAfter = switchMode(token.name + " 🔀");
  }

  return (
    <div>
      <Input
        value={amount}
        placeholder={"amount in " + token.name}
        prefix={prefix}
        addonAfter={<TokenDisplay token={token} setMode={setMode} mode={mode} toggle />}
        onChange={async e => {
          setAmount(e.target.value);
          console.log("pressed");
        }}
      />
    </div>
  );
}
