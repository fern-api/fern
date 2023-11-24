Audiences are a useful tool for segmenting your API for different consumers. Common audiences include:

- Internal consumers (e.g., frontend developers who use the API)
- Beta testers
- Customers

Fern has a first-class concept for marking different endpoints for different audiences:

```yaml user.yml
service:
  base-path: /users
  auth: true
  endpoints:
    sendEmail:
      audiences: # <---
        - external
      path: /send-email
      ...
```

To prevent typos, you must specify all your audiences in `api.yml`:

```yaml api.yml
name: api
audiences:
  - external
```

In `generators.yml`, you can apply audience filters so that only certain
endpoints are passed to the generators:

```yaml generators.yml
groups:
  external:
    audiences: # <---
      - external
    generators: ...
```

By default, if no audiences are specified, then all endpoints are passed to the
generators.
