document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video')

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/models')
    ]).then(startVideo)
    
    function startVideo() {
        navigator.getUserMedia(
            { video: {} },
            stream => video.srcObject = stream,
            err => console.error(err)
        )
    }

    video.addEventListener('playing', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = { width: video.width, height: video.height}
        faceapi.matchDimensions(canvas, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            resizedDetections.forEach(detection => {
                const { age, gender, genderProbability } = detection
                new faceapi.draw.DrawTextField(
                    [
                        `${faceapi.utils.round(age, 0)} years`,
                        `${gender} (${faceapi.utils.round(genderProbability)})`
                    ],
                    detection.detection.box.bottomRight
                ).draw(canvas)
            })
        }, 100)
    }) 
})

