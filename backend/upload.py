import firebase_admin
from firebase_admin import credentials, firestore
import json

def main():
    # Replace with the path to your Firebase service account key JSON file.
    service_account_path = '../serviceAccountKey.json'
    
    # Initialize the Firebase app with the service account
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    
    # Get a reference to the Firestore client
    db = firestore.client()
    
    # Replace with the path to your JSON data file
    json_file_path = './final_sorted.json'
    
    # Read JSON data from file
    try:
        with open(json_file_path, 'r') as file:
            courses_data = json.load(file)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        return
    
    # Reference to the 'courses' collection
    courses_ref = db.collection('courses')
    
    # Upload each course to Firestore
    for course_id, course_info in courses_data.items():
        try:
            courses_ref.document(course_id).set(course_info)
            print(f"Document for {course_id} successfully written!")
        except Exception as e:
            print(f"Error writing document for {course_id}: {e}")

if __name__ == '__main__':
    main()
