# Investigation Summary: FastAPI Union Validation Bug

## Customer's Error
```json
{
  "type": "extra_forbidden",
  "loc": ["body", "filter"],
  "msg": "Extra inputs are not permitted",
  "input": {"type": "or", "filters": []}
}
```

## My Testing Environment
- **Python**: 3.13
- **Pydantic**: 2.12.5
- **FastAPI**: 0.124.0

## What I Tested

### Scenarios Tested (ALL PASSED)
1. Basic inheritance with `extra="forbid"` parent
2. Nested class definitions (like Fern's `_EnvironmentSearchFilter.Or`)
3. Using `class Config` vs `model_config`
4. Strict mode enabled
5. TypeAdapter validation
6. JSON string validation
7. Custom validators on parent
8. Frozen models
9. Discriminated unions
10. RootModel wrappers
11. Actual FastAPI endpoints with TestClient
12. Fern's exact `UniversalBaseModel` pattern
13. Recursive types (filter containing filters)
14. Optional fields
15. Field aliases
16. Missing `model_rebuild()` calls

### Results
**Every single test passed on Pydantic 2.12.5 + FastAPI 0.124.0**

The inheritance works correctly:
- Parent (`OrEnvironmentFilter`) has `extra="forbid"` and `fields: ['filters']`
- Child (`_EnvironmentSearchFilter.Or`) adds `type` field
- Child's `model_fields` correctly shows `['filters', 'type']`
- Validation of `{"type": "or", "filters": []}` succeeds

## Conclusions

### Most Likely Causes of Customer's Issue

1. **Older Pydantic Version**
   - Customer may be on Pydantic 2.0.x - 2.5.x where this inheritance bug might have existed
   - Pydantic 2 has had many fixes for discriminated unions and config inheritance
   - **Solution**: `pip install --upgrade pydantic`

2. **Pydantic V1**
   - Customer might be using Pydantic V1 (couldn't test due to Python 3.13 incompatibility)
   - The generated code supports both V1 and V2
   - **Solution**: Upgrade to Pydantic V2

3. **Older FastAPI Version**
   - FastAPI's request body parsing has evolved
   - **Solution**: `pip install --upgrade fastapi`

4. **Something Specific in Customer's Generated Code**
   - There may be something unique in their Fern definition or generated output
   - Need to see their exact generated files

## Questions to Ask Customer

1. What Pydantic version are you using? (`pip show pydantic`)
2. What FastAPI version are you using? (`pip show fastapi`)
3. Can you upgrade both? (`pip install --upgrade pydantic fastapi`)
4. Does the issue persist after upgrade?
5. Can you share the full stack trace?
6. Can you share the exact generated Python files (not just snippets)?

## If Issue Persists After Upgrade

If the customer is already on latest versions and issue persists, then we need to:
1. Get their exact generated files
2. Get their exact Fern definition
3. Look for differences from our seed tests
4. Possibly there IS a bug but it requires a specific combination we haven't tested

## Files Created During Investigation

```
/tmp/pydantic-bug-demo/
├── venv/                          # Python virtual environment
├── reproduce_bug.py               # Basic reproduction attempt
├── reproduce_bug_v1.py            # Pydantic V1 version
├── reproduce_bug_v2.py            # Pydantic V2 version
├── reproduce_customer_exact.py    # Customer's exact pattern
├── reproduce_exact_fern.py        # Fern's exact generated pattern
├── reproduce_fastapi.py           # FastAPI simulation
├── try_more_scenarios.py          # 13 different scenarios
├── try_actual_fastapi.py          # Real FastAPI with TestClient
├── try_fern_universal_base.py     # Fern's UniversalBaseModel
├── try_old_pydantic_behavior.py   # Edge cases
└── INVESTIGATION_SUMMARY.md       # This file
```
