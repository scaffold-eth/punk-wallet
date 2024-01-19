import React, { useState } from "react";

import { Radio } from "antd";

import { ON_CHAIN_IBAN_VALUE, CROSS_CHAIN_VALUE } from "../helpers/MoneriumHelper";

export default function MoneriumOnChainCrossChainRadio({ moneriumRadio, setMoneriumRadio }) {
  return (
    <div style={{ marginTop: -25, paddingBottom: 25 }}>
      <Radio.Group onChange={e => setMoneriumRadio(e.target.value)} value={moneriumRadio}>
        <Radio.Button value={ON_CHAIN_IBAN_VALUE}>{"OnChain / IBAN"}</Radio.Button>
        <Radio.Button value={CROSS_CHAIN_VALUE}>{`\u00a0\u00a0CrossChain\u00a0\u00a0`}</Radio.Button>
      </Radio.Group>
    </div>
  );
}
