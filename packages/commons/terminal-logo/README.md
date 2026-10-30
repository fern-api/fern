# @fern-api/terminal-logo

Converts an SVG or PNG logo into terminal art for the CLI generator's `banner.file`.

```bash
fern-terminal-logo logo.svg -o fern/assets/cli-banner.txt            # keep the logo's colours
fern-terminal-logo logo.svg -m shape -o fern/assets/cli-banner.txt   # plain blocks, coloured by banner.colors
```

Each terminal cell holds two pixels (`▀`, `▄`, `█`). Transparent margins are cropped and the
logo is scaled to `--width` columns (default 64), keeping its aspect ratio.

```yaml
# generators.yml
config:
  banner:
    file: ./assets/cli-banner.txt
    colors: ["#2929CC", "#4949F2", "#30F2B1"] # shape mode only
    direction: diagonal
    animate: true
```

Programmatic use: `logoToBanner(bytes, { width, mode })` returns the banner string.
