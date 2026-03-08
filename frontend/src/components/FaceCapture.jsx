import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Button from './Button';
import Modal from './Modal';

const FaceCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const handleConfirm = () => {
    onCapture(imgSrc);
  };

  const handleRetake = () => {
    setImgSrc(null);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Face Verification</h2>
        {imgSrc ? (
          <img src={imgSrc} alt="webcam" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
          />
        )}
        <div className="mt-4 flex justify-center space-x-4">
          {imgSrc ? (
            <>
              <Button onClick={handleRetake}>Retake</Button>
              <Button onClick={handleConfirm}>Confirm Vote</Button>
            </>
          ) : (
            <Button onClick={capture}>Capture photo</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FaceCapture;
