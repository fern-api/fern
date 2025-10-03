import unittest
import json
import os
from pathlib import Path
from name_utils import (
    expand_name,
    CasedName,
    SafeAndUnsafeString,
)


class TestNameUtils(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Load test cases from shared JSON file
        test_file = Path(__file__).parents[5] / "name-utils-test-cases.json"
        with open(test_file, 'r') as f:
            test_data = json.load(f)
        cls.test_cases = test_data['testCases']
        cls.cased_name_test_cases = test_data['casedNameTestCases']
    
    def test_expand_name_with_strings(self):
        """Test expand_name with string inputs from shared test cases."""
        for test_case in self.test_cases:
            with self.subTest(input=test_case['input']):
                result = expand_name(test_case['input'])
                expected = test_case['output']
                
                # Check all fields
                self.assertEqual(result.original_name, expected['originalName'])
                self.assertEqual(result.camel_case.unsafe_name, expected['camelCase']['unsafeName'])
                self.assertEqual(result.camel_case.safe_name, expected['camelCase']['safeName'])
                self.assertEqual(result.pascal_case.unsafe_name, expected['pascalCase']['unsafeName'])
                self.assertEqual(result.pascal_case.safe_name, expected['pascalCase']['safeName'])
                self.assertEqual(result.snake_case.unsafe_name, expected['snakeCase']['unsafeName'])
                self.assertEqual(result.snake_case.safe_name, expected['snakeCase']['safeName'])
                self.assertEqual(result.screaming_snake_case.unsafe_name, expected['screamingSnakeCase']['unsafeName'])
                self.assertEqual(result.screaming_snake_case.safe_name, expected['screamingSnakeCase']['safeName'])
    
    def test_expand_name_with_cased_names(self):
        """Test expand_name with CasedName inputs from shared test cases."""
        for test_case in self.cased_name_test_cases:
            with self.subTest(input=test_case['input']['originalName']):
                # Convert JSON input to CasedName object
                input_data = test_case['input']
                cased_name = CasedName(
                    original_name=input_data['originalName'],
                    camel_case=SafeAndUnsafeString(
                        unsafe_name=input_data['camelCase']['unsafeName'],
                        safe_name=input_data['camelCase']['safeName']
                    ) if input_data['camelCase'] else None,
                    pascal_case=SafeAndUnsafeString(
                        unsafe_name=input_data['pascalCase']['unsafeName'],
                        safe_name=input_data['pascalCase']['safeName']
                    ) if input_data['pascalCase'] else None,
                    snake_case=SafeAndUnsafeString(
                        unsafe_name=input_data['snakeCase']['unsafeName'],
                        safe_name=input_data['snakeCase']['safeName']
                    ) if input_data['snakeCase'] else None,
                    screaming_snake_case=SafeAndUnsafeString(
                        unsafe_name=input_data['screamingSnakeCase']['unsafeName'],
                        safe_name=input_data['screamingSnakeCase']['safeName']
                    ) if input_data['screamingSnakeCase'] else None
                )
                
                result = expand_name(cased_name)
                expected = test_case['output']
                
                # Check all fields
                self.assertEqual(result.original_name, expected['originalName'])
                self.assertEqual(result.camel_case.unsafe_name, expected['camelCase']['unsafeName'])
                self.assertEqual(result.camel_case.safe_name, expected['camelCase']['safeName'])
                self.assertEqual(result.pascal_case.unsafe_name, expected['pascalCase']['unsafeName'])
                self.assertEqual(result.pascal_case.safe_name, expected['pascalCase']['safeName'])
                self.assertEqual(result.snake_case.unsafe_name, expected['snakeCase']['unsafeName'])
                self.assertEqual(result.snake_case.safe_name, expected['snakeCase']['safeName'])
                self.assertEqual(result.screaming_snake_case.unsafe_name, expected['screamingSnakeCase']['unsafeName'])
                self.assertEqual(result.screaming_snake_case.safe_name, expected['screamingSnakeCase']['safeName'])


if __name__ == "__main__":
    unittest.main()