import React from "react";

export default function LogoOnLogo ({ src1, src2, sizeMultiplier1 = 1, sizeMultiplier2 = 0.375, showImage2 = true, onClickAction = () => {} }) {
    return (
        <div style={{ position: 'relative', display: 'inline-block' }} onClick={() => {onClickAction()}} >
            <img
                src={src1}
                alt={src1}
                style={{
                    width: `${sizeMultiplier1}em`,
                    height: `${sizeMultiplier1}em`
                }}
            />
            {showImage2 && <img
                src={src2}
                alt={src2}
                style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: `${sizeMultiplier1 * sizeMultiplier2}em`,
                    height: `${sizeMultiplier1 * sizeMultiplier2}em`
                }}
            />}
        </div>
    );
};