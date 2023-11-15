import React from "react";
import QR from 'qrcode.react';
import { Blockie } from "."
import { message } from 'antd';

export default function QRPunkBlockie(props) {
  const hardcodedSizeForNow = 380

  const punkSize = 112

  let part1 = props.address && props.address.substr(2,20)
  let part2= props.address && props.address.substr(22)
  const x = parseInt(part1, 16)%100
  const y = parseInt(part2, 16)%100

  return (
    <div style={{transform:"scale("+(props.scale?props.scale:"1")+")",transformOrigin:"50% 50%",margin:"auto", position:"relative",width:hardcodedSizeForNow}} onClick={()=>{
       const el = document.createElement('textarea');
       el.value = props.address;
       document.body.appendChild(el);
       el.select();
       document.execCommand('copy');
       document.body.removeChild(el);
       const iconPunkSize = 40
       message.success(
         <span style={{position:"relative"}}>
          Copied Address
          <div style={{position:"absolute",left:-60,top:-14}}>
            <div style={{position:"relative",width:iconPunkSize, height:iconPunkSize-1, overflow: "hidden"}}>
              <img src="/punks.png" style={{position:"absolute",left:-iconPunkSize*x,top:(-iconPunkSize*y),width:iconPunkSize*100, height:iconPunkSize*100,imageRendering:"pixelated"}} />
            </div>
          </div>
         </span>
       );
    }}>

      <div style={{position:"absolute",opacity:0.5,left:hardcodedSizeForNow/2-46,top:hardcodedSizeForNow/2-46}}>
        <Blockie address={props.address} scale={11.5}/>
      </div>

      <div style={{position:"absolute",left:hardcodedSizeForNow/2-53,top:hardcodedSizeForNow/2-65}}>
        <div style={{position:"relative",width:punkSize, height:punkSize-1, overflow: "hidden"}}>
          <img src="/punks.png" style={{position:"absolute",left:-punkSize*x,top:(-punkSize*y)-1,width:punkSize*100, height:punkSize*100,imageRendering:"pixelated"}} />
        </div>
      </div>

      {props.withQr ? <QR
        level={"H"}
        includeMargin={false}
        value={props.address?props.address:""}
        size={hardcodedSizeForNow}
        imageSettings={{width:105,height:105,excavate:true,src:""}}
      /> : ""}

      {props.showAddress ? <div style={{fontWeight:"bolder",letterSpacing:-0.8,color:"#666666",fontSize:14.8}}>{props.address}</div>: ""}
    </div>
  );
}
