import os
import base64
import cv2
import numpy as np
from PIL import Image
import io
from models.user_model import User

class FaceService:
    def __init__(self):
        self.face_recognition_enabled = True
        self.tolerance = 0.6
        self.face_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'face_data')
        
        # Create face_data directory if it doesn't exist
        os.makedirs(self.face_data_dir, exist_ok=True)
    
    def base64_to_image(self, base64_string):
        """Convert base64 string to OpenCV image"""
        try:
            if base64_string.startswith('data:image'):
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB then to OpenCV format
            image = image.convert('RGB')
            image_array = np.array(image)
            opencv_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            
            return opencv_image
            
        except Exception as e:
            raise ValueError(f"Invalid image format: {str(e)}")
    
    def get_face_image_path(self, user_id):
        """Get the path for storing user's face image"""
        return os.path.join(self.face_data_dir, f"{user_id}.jpg")
    
    def detect_face(self, image):
        """Detect face in image using OpenCV Haar Cascade"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Load face cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return None
        
        # Return the first face
        return faces[0]
    
    def register_user_face(self, user_id, face_image):
        """Register user's face by saving the image"""
        try:
            user = User.find_by_id(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            # Convert base64 to image
            image = self.base64_to_image(face_image)
            
            # Check if face is detected
            face = self.detect_face(image)
            if face is None:
                return {'success': False, 'message': 'No face detected in the image'}
            
            # Save image to face_data directory
            image_path = self.get_face_image_path(user_id)
            
            # Save as BGR for OpenCV compatibility
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(image_rgb)
            pil_image.save(image_path, 'JPEG')
            
            print(f"[OK] Face image saved for user {user_id}: {image_path}")
            
            return {
                'success': True,
                'message': 'Face registered successfully'
            }
            
        except Exception as e:
            print(f"[ERR] Face registration error: {e}")
            return {'success': False, 'message': str(e)}
    
    def verify_user_face(self, user_id, face_image):
        """Verify user's face using OpenCV"""
        try:
            user = User.find_by_id(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            # Check if user has registered face
            stored_image_path = self.get_face_image_path(user_id)
            if not os.path.exists(stored_image_path):
                return {'success': False, 'message': 'No face data found for this user'}
            
            # Load the stored image
            stored_image = cv2.imread(stored_image_path)
            if stored_image is None:
                return {'success': False, 'message': 'Failed to load stored face image'}
            
            # Convert the captured image
            captured_image = self.base64_to_image(face_image)
            
            # Detect faces in both images
            stored_face = self.detect_face(stored_image)
            captured_face = self.detect_face(captured_image)
            
            if stored_face is None:
                return {'success': False, 'message': 'No face detected in stored image'}
            
            if captured_face is None:
                return {'success': False, 'message': 'No face detected in captured image'}
            
            # Extract faces
            x1, y1, w1, h1 = stored_face
            stored_face_roi = stored_image[y1:y1+h1, x1:x1+w1]
            
            x2, y2, w2, h2 = captured_face
            captured_face_roi = captured_image[y2:y2+h2, x2:x2+w2]
            
            # Resize both faces to same size
            face_size = (150, 150)
            stored_face_resized = cv2.resize(stored_face_roi, face_size)
            captured_face_resized = cv2.resize(captured_face_roi, face_size)
            
            # Convert to grayscale for comparison
            stored_gray = cv2.cvtColor(stored_face_resized, cv2.COLOR_BGR2GRAY)
            captured_gray = cv2.cvtColor(captured_face_resized, cv2.COLOR_BGR2GRAY)
            
            # Calculate histogram similarity
            hist_stored = cv2.calcHist([stored_gray], [0], None, [256], [0, 256])
            hist_captured = cv2.calcHist([captured_gray], [0], None, [256], [0, 256])
            
            # Normalize histograms
            cv2.normalize(hist_stored, hist_stored, 0, 1, cv2.NORM_MINMAX)
            cv2.normalize(hist_captured, hist_captured, 0, 1, cv2.NORM_MINMAX)
            
            # Compare histograms
            similarity = cv2.compareHist(hist_stored, hist_captured, cv2.HISTCMP_CORREL)
            
            print(f"[INFO] Face similarity: {similarity}")
            
            # Consider it a match if similarity > 0.5
            if similarity > 0.5:
                return {
                    'success': True,
                    'message': 'Face verified successfully',
                    'distance': 1 - similarity
                }
            else:
                return {
                    'success': False,
                    'message': 'Face verification failed - faces do not match',
                    'distance': 1 - similarity
                }
                
        except Exception as e:
            print(f"[ERR] Face verification error: {e}")
            return {'success': False, 'message': str(e)}
    
    def toggle_face_recognition(self, enabled):
        self.face_recognition_enabled = enabled
        return {'success': True, 'enabled': enabled}
    
    def get_face_recognition_status(self):
        return {
            'enabled': self.face_recognition_enabled,
            'available': True,
            'method': 'OpenCV histogram comparison',
            'tolerance': self.tolerance
        }

face_service = FaceService()
