import cv2
from pyzbar import pyzbar
import tkinter as tk
from tkinter import filedialog, messagebox
import sys
import os

class QRScanner:
    def __init__(self):
        self.root = None
        
    def extract_url_from_qr(self, image_path):
        """
        Extract URL from QR code in image
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            str: URL from QR code, None if not found
        """
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                return None
                
            # Detect and decode QR codes
            qr_codes = pyzbar.decode(image)
            
            if qr_codes:
                qr_data = qr_codes[0].data.decode('utf-8')
                print(f"✅ QR extracted successfully! Link: {qr_data}")
                return qr_data
            else:
                print("❌ No QR code found in the image")
                return None
            # if qr_codes:
            #     # Get the data from the first QR code
            #     qr_data = qr_codes[0].data.decode('utf-8')
            #     return qr_data
            # else:
            #     return None
                
        except Exception as e:
            print(f"Error: {str(e)}")
            return None
    
    def select_qr_image(self):
        """
        Open file dialog to select QR image and extract URL
        
        Returns:
            str: URL from QR code, None if failed
        """
        try:
            # Initialize tkinter if needed
            if not self.root:
                self.root = tk.Tk()
                self.root.withdraw()  # Hide main window
            
            # Open file dialog
            file_path = filedialog.askopenfilename(
                title="Select QR Code Image",
                filetypes=[
                    ("Image files", "*.jpg *.jpeg *.png *.gif *.bmp"),
                    ("All files", "*.*")
                ]
            )
            
            if file_path:
                # Extract URL from QR code
                url = self.extract_url_from_qr(file_path)
                
                if url:
                    return url
                else:
                    messagebox.showerror("Error", "No QR code found in image")
                    return None
            else:
                return None  # User cancelled
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to process image: {str(e)}")
            return None

def main():
    """Main function - extract URL from QR image"""
    scanner = QRScanner()
    
    if len(sys.argv) > 1:
        # Command line mode - image path provided
        image_path = sys.argv[1]
        if os.path.exists(image_path):
            url = scanner.extract_url_from_qr(image_path)
            if url:
                print(url)  # Just print the URL
            else:
                print("ERROR: No QR code found")
        else:
            print("ERROR: Image file not found")
    else:
        # Interactive mode - file dialog
        url = scanner.select_qr_image()
        if url:
            print(url)  # Just print the URL

if __name__ == "__main__":
    main()