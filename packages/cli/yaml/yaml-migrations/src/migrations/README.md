## Migrations

The folder name should be a version that precedes the migration. For example:

```
migrations/
  0.0.188/
    generators-configuration/
      ...
```

When someone upgrades _past_ 0.0.188, the `generators-configuration` migration is run.
