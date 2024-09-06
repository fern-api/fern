## Migrations

The folder name should be a version that precedes the migration. For example:

```
migrations/
  0.0.188/
    generators-configuration/
      ...
```

When someone upgrades to a version that is later than 0.0.188, the `generators-configuration` migration is run.
