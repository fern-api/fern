# Pydantic Union Bug Investigation Summary

## What I Tested

I tried to reproduce the customer's error:
```json
{"type": "extra_forbidden", "msg": "Extra inputs are not permitted", "input": {"type": "or", "filters": []}}
```

## Test Results

**Pydantic 2.12.5**: All tests PASS - no error reproduced

The inheritance from a parent with `extra="forbid"` works correctly in Pydantic 2.12.5:
- Parent class (`OrEnvironmentFilter`) has `extra="forbid"` and fields `[filters]`
- Child class (`_EnvironmentSearchFilter.Or`) adds `type` field
- Parsing `{"type": "or", "filters": []}` succeeds!

## What This Means

Either:

1. **The bug was fixed in a recent Pydantic version** - The customer might be on an older Pydantic 2.x version where the inheritance bug existed

2. **The bug is Pydantic V1 specific** - The customer might be using Pydantic V1 (couldn't test due to Python 3.13 compatibility)

3. **There's something different in the actual generated code** - The exact customer setup might have something different triggering the issue

## What the Customer Should Try

1. **Check their Pydantic version**: `pip show pydantic`
2. **Upgrade Pydantic**: `pip install --upgrade pydantic`
3. **Share the exact generated files** if the issue persists after upgrade

## Files Created

- `reproduce_bug.py` - Basic reproduction attempt
- `reproduce_bug_v1.py` - Pydantic V1 version
- `reproduce_bug_v2.py` - Pydantic V2 version
- `reproduce_fastapi.py` - FastAPI simulation
- `reproduce_exact_fern.py` - Exact Fern generated pattern
- `reproduce_customer_exact.py` - Customer's exact pattern
