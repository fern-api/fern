# Shared Dev Dependencies

This package lists the dev dependencies in package.json that are shared with other projects.
To make sure every dependency is available to the consuming package, each dependency must also be added to `.npmrc` as a `public-hoist-pattern[]`.