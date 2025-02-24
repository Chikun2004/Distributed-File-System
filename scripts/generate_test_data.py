from pymongo import MongoClient
import datetime
import random
import string
import os
import gridfs

def generate_random_content(size=1024):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=size))

def generate_random_filename():
    return ''.join(random.choices(string.ascii_lowercase, k=8)) + '.txt'

def create_sample_files():
    # Create sample files directory if it doesn't exist
    sample_dir = os.path.join(os.path.dirname(__file__), '..', 'sample_files')
    os.makedirs(sample_dir, exist_ok=True)
    
    files = []
    for i in range(5):
        filename = generate_random_filename()
        filepath = os.path.join(sample_dir, filename)
        with open(filepath, 'w') as f:
            f.write(generate_random_content())
        files.append(filepath)
    return files

def insert_test_data(db_path, port, is_primary=True):
    # Ensure MongoDB data directory exists
    os.makedirs(db_path, exist_ok=True)
    
    try:
        # Connect to MongoDB instance
        client = MongoClient(f'mongodb://localhost:{port}')
        db = client['dfs']
        fs = gridfs.GridFS(db)
        
        # Create sample files and store them
        sample_files = create_sample_files()
        
        for file_path in sample_files:
            with open(file_path, 'rb') as f:
                filename = os.path.basename(file_path)
                # Store the file in GridFS
                file_id = fs.put(
                    f.read(),
                    filename=filename,
                    upload_date=datetime.datetime.utcnow(),
                    status='active',
                    location='primary' if is_primary else 'secondary'
                )
                print(f"Inserted file {filename} with ID {file_id}")
        
        print(f"Successfully inserted test data into MongoDB on port {port}")
        
    except Exception as e:
        print(f"Error inserting test data: {str(e)}")
    finally:
        if 'client' in locals():
            client.close()

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Setup primary MongoDB
    primary_path = os.path.join(base_dir, 'mongodb_data_primary')
    insert_test_data(primary_path, 27017, is_primary=True)
    
    # Setup secondary MongoDB
    secondary_path = os.path.join(base_dir, 'mongodb_data_secondary')
    insert_test_data(secondary_path, 27018, is_primary=False)

if __name__ == '__main__':
    main()
