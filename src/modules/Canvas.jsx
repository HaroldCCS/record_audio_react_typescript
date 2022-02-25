import React, { useRef, useEffect } from 'react'

const Canvas = props => {

    const canvasRef = useRef(null)


    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let tamañoPantalla  = 200;
        goAnimation()

        function goAnimation() {
            let initial = 20;
            let yInitial = initial;
            let xCount = initial - 20;
            let avanceLento = 2.5;
            let altura = 8; 

            const add = (posNeg) => {
                xCount += avanceLento;
                ctx.lineTo(xCount, yInitial + ((Math.floor(Math.random() * (altura - 1)) + 1) * posNeg))

                xCount += avanceLento;
                ctx.lineTo(xCount, yInitial)
            }

            ctx.clearRect(0, 0, tamañoPantalla, 40);
            ctx.beginPath();
            ctx.moveTo(initial - 20, initial);

            for (let y = 0; y < tamañoPantalla; y += 10) {
                add(1)
                add(-1)
            }
            ctx.stroke();

            setTimeout(() => {
                goAnimation()
            }, 90)
        }
    }, [])

    return <canvas ref={canvasRef} {...props} width="200px" height="40px" />
}

export default Canvas




