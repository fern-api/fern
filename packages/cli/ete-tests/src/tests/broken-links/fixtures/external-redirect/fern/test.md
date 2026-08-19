# Test External Redirect Links

This fixture tests that links to internal paths that redirect to external URLs
are NOT incorrectly flagged as broken links.

## Links that redirect to external URLs (should NOT be flagged)

1. Link to /ui which redirects externally: [Developer Console](/ui)
2. Link to /ui subpath which redirects externally: [Applications](/ui/applications)
3. Link to /console which redirects externally: [Console](/console)
4. Full URL to same domain with redirect: [Full URL](https://developer.example.com/ui)

## Regular external link (should NOT be flagged)

1. External link: [Google](https://google.com)

