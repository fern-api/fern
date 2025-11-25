# Test External Links with Query Parameters

This fixture tests that external URLs containing the docs domain in query parameters
are NOT incorrectly flagged as broken internal links.

## External Links (should NOT be flagged)

1. External link with docs domain in query param: [Contact us](<https://conduitxyz.typeform.com/to/VY5a5URt?typeform-source=docs.conduit.xyz>)
2. Regular external link: [Google](https://google.com)
