"""
Test to verify that the generated SDK does not contain print() statements.
This test ensures we're using proper logging instead of print statements.
"""

import os
import re
from pathlib import Path


def test_no_print_statements():
    """Verify that no print() statements exist in generated SDK code."""
    test_dir = Path(__file__).parent
    sdk_dir = test_dir.parent / "src"
    
    python_files = []
    for root, dirs, files in os.walk(sdk_dir):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for file in files:
            if file.endswith(".py"):
                python_files.append(Path(root) / file)
    
    print_pattern = re.compile(r'^\s*print\s*\(', re.MULTILINE)
    
    files_with_print = []
    for py_file in python_files:
        with open(py_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if print_pattern.search(content):
            files_with_print.append(py_file.relative_to(sdk_dir))
    
    if files_with_print:
        file_list = '\n  '.join(str(f) for f in files_with_print)
        raise AssertionError(
            f"Found print() statements in generated SDK code. "
            f"Please use logging instead.\n"
            f"Files with print statements:\n  {file_list}"
        )
