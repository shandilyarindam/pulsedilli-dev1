import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    # Remove dark:something classes
    content = re.sub(r'\bdark:[a-zA-Z0-9\-\/]+', '', content)
    # Cleanup double spaces
    content = re.sub(r'  +', ' ', content)
    
    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)
for f in files:
    process_file(f)
