### IR Migrations

This directory contains the IR migrations.

We sometimes break the IR format. When running an old generator, we will need to
migrate the IR backwards to a version that the old generator will recognize.

Each folder in this directory contains a single migration. The folder name is
the name of the IR being migrated _to_. For example, the directory `ir-v1/` contains
the migration to migrate from `ir-v2` to `ir-v1`.
