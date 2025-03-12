#!/usr/bin/env python3
import unittest
import sys

def run_all_tests():
    """Run all test cases"""
    test_suite = unittest.defaultTestLoader.discover('.', pattern='test_*.py')
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    return result.wasSuccessful()

def run_specific_test(test_module):
    """Run a specific test module"""
    try:
        test_suite = unittest.defaultTestLoader.loadTestsFromName(test_module)
        test_runner = unittest.TextTestRunner(verbosity=2)
        result = test_runner.run(test_suite)
        return result.wasSuccessful()
    except ImportError:
        print(f"Error: Test module '{test_module}' not found.")
        return False

if __name__ == '__main__':
    # If a test module name is provided, run only that test
    if len(sys.argv) > 1:
        test_module = sys.argv[1]
        success = run_specific_test(test_module)
    else:
        # Otherwise run all tests
        success = run_all_tests()
    
    # Exit with appropriate status code
    sys.exit(0 if success else 1) 