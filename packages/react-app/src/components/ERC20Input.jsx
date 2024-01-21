import React, { useState } from "react";

import { Input } from "antd";

import { TokenDisplay } from "./";

// ToDo: Prefix could be updated with token symbol instead of ticker

export default function ERC20Input({ token, amount, setAmount }) {
  const [mode, setMode] = useState(token.name);

  let prefix;

  if (mode === "USD") {
    prefix = "$";
  } else {
    prefix = token.name;
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
        }}
      />
    </div>
  );
}
