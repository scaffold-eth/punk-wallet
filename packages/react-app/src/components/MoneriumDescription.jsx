import React from "react";

export default function MoneriumDescription( { } ) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
                src="/EURe.png"
                alt="EURe"
                style={{ width: '20%', height: '20%' }}
            />
            <div style={{ paddingLeft: '0.42em', fontSize: '1.2em' }}>
                <p>
                    The <a href="https://monerium.com/" target="_blank" rel="noopener noreferrer" style={{color: '#2385c4', fontWeight: 'bold'}}>EURe</a> is a fully authorised and regulated euro stablecoin for web3 available on Ethereum, Polygon, and Gnosis. Send and receive euros between any bank account and Web3 wallet.
                </p>
            </div>
        </div>
    );
}