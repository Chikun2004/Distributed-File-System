import os
import subprocess
import sys
import time

def create_mongodb_dirs():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Create directories for primary and secondary MongoDB instances
    primary_path = os.path.join(base_dir, 'mongodb_data_primary')
    secondary_path = os.path.join(base_dir, 'mongodb_data_secondary')
    
    os.makedirs(primary_path, exist_ok=True)
    os.makedirs(secondary_path, exist_ok=True)
    
    print(f"Created MongoDB data directories:\n{primary_path}\n{secondary_path}")
    return primary_path, secondary_path

def start_mongodb_instances(primary_path, secondary_path):
    try:
        # Start primary MongoDB instance
        primary_cmd = f'mongod --dbpath "{primary_path}" --port 27017'
        subprocess.Popen(primary_cmd, shell=True)
        print("Started primary MongoDB instance on port 27017")
        
        # Start secondary MongoDB instance
        secondary_cmd = f'mongod --dbpath "{secondary_path}" --port 27018'
        subprocess.Popen(secondary_cmd, shell=True)
        print("Started secondary MongoDB instance on port 27018")
        
        # Wait for MongoDB instances to start
        time.sleep(5)
        print("MongoDB instances are ready")
        
    except Exception as e:
        print(f"Error starting MongoDB instances: {str(e)}")
        sys.exit(1)

def main():
    print("Setting up MongoDB instances...")
    primary_path, secondary_path = create_mongodb_dirs()
    start_mongodb_instances(primary_path, secondary_path)
    print("\nSetup complete! You can now run generate_test_data.py to populate the databases.")

if __name__ == '__main__':
    main()
