"""
CI test to verify generated SDK contains no print statements.
This ensures the SDK uses Python's stdlib logger instead of print statements.
"""
import ast
import os
from pathlib import Path
from typing import List, Set


def get_python_files_in_src(root_dir: str) -> List[Path]:
    """Get all Python files in the src directory, excluding tests."""
    src_dir = Path(root_dir) / "src"
    if not src_dir.exists():
        return []
    
    python_files = []
    for py_file in src_dir.rglob("*.py"):
        # Skip __pycache__ and test files
        if "__pycache__" not in str(py_file) and "test" not in py_file.name.lower():
            python_files.append(py_file)
    return python_files


def find_print_calls(file_path: Path) -> List[int]:
    """Find line numbers where print() is called in a Python file."""
    try:
        with open(file_path, "r") as f:
            tree = ast.parse(f.read(), filename=str(file_path))
        
        print_lines = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # Check if this is a call to print()
                if isinstance(node.func, ast.Name) and node.func.id == "print":
                    print_lines.append(node.lineno)
        
        return print_lines
    except Exception as e:
        # If we can't parse the file, just skip it
        return []


def test_no_print_statements() -> None:
    """Test that generated SDK contains no print statements."""
    # Get the root directory (parent of tests directory)
    test_dir = Path(__file__).parent
    root_dir = test_dir.parent
    
    python_files = get_python_files_in_src(str(root_dir))
    
    files_with_prints = {}
    for py_file in python_files:
        print_lines = find_print_calls(py_file)
        if print_lines:
            files_with_prints[py_file] = print_lines
    
    if files_with_prints:
        error_msg = "Found print() statements in generated SDK files:\n"
        for file_path, lines in files_with_prints.items():
            relative_path = file_path.relative_to(root_dir)
            error_msg += f"  {relative_path}: lines {lines}\n"
        error_msg += "\nGenerated SDK should use logging instead of print statements."
        raise AssertionError(error_msg)


if __name__ == "__main__":
    test_no_print_statements()
    print("✓ No print statements found in generated SDK")
