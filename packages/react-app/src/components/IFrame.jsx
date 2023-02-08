import React, { useState, useEffect } from "react";
import { Input, Button, Spin, Modal, Row, Col, notification } from "antd";
import { SendOutlined } from "@ant-design/icons";
import axios from "axios";
import WalletConnectTransactionDisplay from "./WalletConnectTransactionDisplay";
import { useSafeInject } from "../contexts/SafeInjectContext.tsx";
import { NETWORKS } from "../constants";
import { TransactionManager } from "../helpers/TransactionManager";

const { confirm } = Modal;

export default function IFrame({ address, userProvider, mainnetProvider }) {
  const cachedNetwork = window.localStorage.getItem("network");
  const targetNetwork = NETWORKS[cachedNetwork || "ethereum"];

  const { setAddress, appUrl, setAppUrl, setRpcUrl, iframeRef, newTx } = useSafeInject();

  const [isSafeDappsOpen, setIsSafeDappsOpen] = useState(false);
  const [safeDapps, setSafeDapps] = useState({});
  const [searchSafeDapp, setSearchSafeDapp] = useState();
  const [filteredSafeDapps, setFilteredSafeDapps] = useState();

  const [isIFrameLoading, setIsIFrameLoading] = useState(false);
  const [inputAppUrl, setInputAppUrl] = useState();
  const [tx, setTx] = useState();

  useEffect(() => {
    setAddress(address);
    setRpcUrl(targetNetwork.rpcUrl);
  }, [address]);

  useEffect(() => {
    if (newTx) {
      setTx(newTx);
    }
  }, [newTx]);

  useEffect(() => {
    if (tx) {
      confirm({
        width: "90%",
        size: "large",
        title: "Send Transaction?",
        icon: <SendOutlined />,
        content: (
          <WalletConnectTransactionDisplay
            payload={{
              method: "eth_sendTransaction",
              params: [tx],
            }}
            provider={mainnetProvider}
            chainId={targetNetwork.chainId}
          />
        ),
        onOk: async () => {
          let result;
          let params;

          try {
            const signer = userProvider.getSigner();

            params = tx;
            delete params.id; // invalid key for signer.sendTransaction

            // Ethers uses gasLimit instead of gas
            const gasLimit = params.gas;
            params.gasLimit = gasLimit;
            delete params.gas;

            // Speed up transaction list is filtered by chainId
            if (!params.chainId) {
              params.chainId = targetNetwork.chainId;
            }

            // Remove empty data
            // I assume wallet connect adds "data" here: https://github.com/WalletConnect/walletconnect-monorepo/blob/7573fa9e1d91588d4af3409159b4fd2f9448a0e2/packages/helpers/utils/src/ethereum.ts#L78
            // And ethers cannot hexlify this: https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/providers/src.ts/json-rpc-provider.ts#L694
            if (params.data === "") {
              delete params.data;
            }

            console.log({ params });
            result = await signer.sendTransaction(params);
            console.log({ params });

            const transactionManager = new TransactionManager(userProvider, signer, true);
            transactionManager.setTransactionResponse(result);
          } catch (error) {
            // Fallback to original code without the speed up option
            console.error("Coudn't create transaction which can be speed up", error);
            result = await userProvider.send("eth_sendTransaction", params);
          }
          console.log("RESULT:", result);

          const iframeRresult = result.hash ? result.hash : result.raw ? result.raw : result;

          notification.info({
            message: "IFrame Transaction Sent",
            description: iframeRresult,
            placement: "bottomRight",
          });
        },
        onCancel: () => {
          console.log("Cancel");
        },
      });
    }
  }, [tx]);

  useEffect(() => {
    const fetchSafeDapps = async chainId => {
      const response = await axios.get(`https://safe-client.gnosis.io/v1/chains/${chainId}/safe-apps`);
      setSafeDapps(dapps => ({
        ...dapps,
        [chainId]: response.data.filter(d => ![29, 11].includes(d.id)), // Filter out Transaction Builder and WalletConnect
      }));
    };

    if (isSafeDappsOpen && !safeDapps[targetNetwork.chainId]) {
      fetchSafeDapps(targetNetwork.chainId);
    }
  }, [isSafeDappsOpen, safeDapps, targetNetwork]);

  useEffect(() => {
    if (safeDapps[targetNetwork.chainId]) {
      setFilteredSafeDapps(
        safeDapps[targetNetwork.chainId].filter(dapp => {
          if (!searchSafeDapp) return true;

          return (
            dapp.name.toLowerCase().indexOf(searchSafeDapp.toLocaleLowerCase()) !== -1 ||
            dapp.url.toLowerCase().indexOf(searchSafeDapp.toLocaleLowerCase()) !== -1
          );
        }),
      );
    } else {
      setFilteredSafeDapps(undefined);
    }
  }, [safeDapps, targetNetwork, searchSafeDapp]);

  return (
    <div style={{ marginTop: 16 }}>
      <div>Connect via iframe:</div>
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: 16,
        }}
      >
        <div className="flex flex-col items-center">
          <Button onClick={() => setIsSafeDappsOpen(true)}>Select from supported dapps</Button>
        </div>
        <Modal
          title="Select a dapp"
          visible={isSafeDappsOpen}
          onCancel={() => setIsSafeDappsOpen(false)}
          footer={null}
          destroyOnClose
          closable
          maskClosable
        >
          <div
            style={{
              minHeight: "30rem",
              maxHeight: "30rem",
              overflow: "scroll",
              overflowX: "auto",
              overflowY: "auto",
            }}
          >
            {!safeDapps ||
              (!safeDapps[targetNetwork.chainId] && (
                <div>
                  <Spin />
                </div>
              ))}
            <div
              style={{
                paddingBottom: "2rem",
                paddingLeft: "2rem",
                paddingRight: "2rem",
              }}
            >
              {safeDapps && safeDapps[targetNetwork.chainId] && (
                <div
                  style={{
                    paddingBottom: "1.5rem",
                  }}
                >
                  <Input
                    placeholder="search 🔎"
                    style={{ maxWidth: "30rem" }}
                    value={searchSafeDapp}
                    onChange={e => setSearchSafeDapp(e.target.value)}
                  />
                </div>
              )}
              <Row gutter={[16, 16]}>
                {filteredSafeDapps &&
                  filteredSafeDapps.map((dapp, i) => (
                    <Col
                      key={i}
                      className="gutter-row"
                      span={8}
                      style={{
                        maxWidth: "140px",
                      }}
                    >
                      <Button
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "1rem",
                          height: "100%",
                          width: "100%",
                          borderRadius: "10px",
                        }}
                        onClick={() => {
                          setAppUrl(dapp.url);
                          setInputAppUrl(dapp.url);
                          setIsSafeDappsOpen(false);
                        }}
                      >
                        <img
                          src={dapp.iconUrl}
                          alt={dapp.name}
                          style={{
                            width: "2rem",
                            borderRadius: "full",
                          }}
                        />
                        <div
                          style={{
                            marginTop: "0.5rem",
                            textAlign: "center",
                            width: "6rem",
                            overflow: "hidden",
                          }}
                        >
                          {dapp.name}
                        </div>
                      </Button>
                    </Col>
                  ))}
              </Row>
            </div>
          </div>
        </Modal>
        <Input
          placeholder="custom dapp URL"
          style={{
            marginTop: 16,
            minWidth: "18rem",
            maxWidth: "20rem",
          }}
          autoFocus
          value={inputAppUrl}
          onChange={e => setInputAppUrl(e.target.value)}
        />
        <Button
          type="primary"
          style={{
            maxWidth: "8rem",
          }}
          onClick={() => {
            setAppUrl(inputAppUrl);
            setIsIFrameLoading(true);
          }}
        >
          {isIFrameLoading ? <Spin /> : "Load"}
        </Button>
        {appUrl && (
          <iframe
            title="app"
            src={appUrl}
            width="1000rem"
            height="500rem"
            style={{
              marginTop: "1rem",
              maxWidth: "100%",
            }}
            ref={iframeRef}
            onLoad={() => setIsIFrameLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
