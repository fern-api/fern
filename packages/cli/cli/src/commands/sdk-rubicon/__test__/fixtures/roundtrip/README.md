# Round-trip fixtures

One folder per fixture: every `cli-*` test definition, plus `x-fern-global-parameters`, `query-parameters-openapi`
and `file-upload-openapi`.

| File | What it is |
|---|---|
| `generators.original.yml` | The test definition's `auth-schemes` and `api`, with one `cli` group whose `config` is the fixture's first variant in `seed/cli/seed.yml`, at fern-cli-generator 0.49.0 |
| `sdk-config.yml` | What `fern sdk migrate --group cli` (the CLI built from this branch) writes from it |
| `migrate-warnings.txt` | The warnings migrate printed |

`roundTrip.expected.json` records, per fixture, which `generators.yml` fields rubicon's output lacks (and why), and how
many generated files differ from Fern's control in the Docker round trip, from rubicon alone and after adding back the
fields migrate dropped. Every difference comes from a field SDK Config cannot hold.

Commands, from the repository root:

```
pnpm fern:build
RUBICON_CAPTURE=1 pnpm --filter @fern-api/cli exec vitest --run roundTrip.capture    # recapture the inputs
RUBICON_RECORD=1 pnpm --filter @fern-api/cli exec vitest --run roundTrip.fast        # rerecord the field differences
RUBICON_ROUNDTRIP=1 pnpm --filter @fern-api/cli exec vitest --run roundTrip.docker   # Docker round trip
```

Add `RUBICON_RECORD=1` to the Docker run to rerecord the file counts. Review every changed entry before committing.
