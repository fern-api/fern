# Fern CLI Auto-Completion

This document describes how to set up auto-completion for the Fern CLI using various shell completion frameworks.

## Carapace Completion

Fern CLI includes built-in support for [carapace](https://github.com/rsteube/carapace), a universal shell completion framework.

### Installation

1. **Install carapace** (if not already installed):
   ```bash
   # macOS (via Homebrew)
   brew install rsteube/tap/carapace

   # Linux (via package manager or download from releases)
   # See: https://github.com/rsteube/carapace/releases
   ```

2. **Generate completion spec**:
   ```bash
   # Generate carapace completion spec
   fern completion --format carapace > ~/.config/carapace/specs/fern.yaml

   # Or use the dedicated script (after compiling)
   node packages/cli/cli/scripts/generate-carapace-completion.js > fern.yaml
   ```

3. **Configure your shell** to use carapace completions:

   **For Bash:**
   ```bash
   echo "source <(carapace _carapace)" >> ~/.bashrc
   ```

   **For Zsh:**
   ```bash
   echo "source <(carapace _carapace)" >> ~/.zshrc
   ```

   **For Fish:**
   ```bash
   mkdir -p ~/.config/fish/completions
   carapace _carapace fish > ~/.config/fish/completions/_carapace.fish
   ```

4. **Restart your shell** or source your configuration:
   ```bash
   source ~/.bashrc   # or ~/.zshrc
   ```

### Usage

Once configured, you can use tab completion with Fern CLI commands:

```bash
fern <TAB>           # Shows available commands
fern generate <TAB>  # Shows generate command options
fern check --<TAB>   # Shows available flags for check command
```

### Features

The carapace completion provides:

- **Command completion**: All available Fern CLI commands and subcommands
- **Flag completion**: Command-line flags with descriptions
- **Value completion**: Contextual value suggestions for:
  - Log levels (`debug`, `info`, `warn`, `error`)
  - Generation languages (e.g., `typescript`, `python`, `go`)
  - Container runners (`docker`, `podman`)
  - File paths (for file-related options)
  - Directory paths (for directory-related options)

### Advanced Configuration

You can customize the completion behavior by modifying the generated spec file:

1. Edit `~/.config/carapace/specs/fern.yaml`
2. Add custom completion actions for specific use cases
3. Restart your shell to reload the configuration

### Troubleshooting

**Completion not working:**
1. Verify carapace is installed: `carapace --help`
2. Check the spec file exists: `ls ~/.config/carapace/specs/fern.yaml`
3. Ensure your shell configuration sources carapace
4. Try regenerating the completion spec

**Outdated completions:**
- Regenerate the spec file when updating Fern CLI to get new commands and options

**Missing completions for custom generators:**
- The completion spec includes common generator patterns, but custom generators may need manual specification

### Development

To modify or extend the completion specification:

1. Edit `packages/cli/cli/src/carapace-completion.ts`
2. Run `pnpm compile` to build the changes
3. Regenerate the spec: `fern completion --format carapace > fern.yaml`
4. Test with your shell

The completion specification is generated from the CLI command definitions, so most changes to CLI commands will automatically be reflected in the completions.

## Other Completion Frameworks

Currently, Fern CLI provides built-in support for carapace. Support for other completion frameworks (like bash-completion, zsh-completions) may be added in the future.

If you need completions for a different framework, you can:

1. Use carapace as it supports multiple shells
2. Create a custom completion script based on the carapace spec
3. Submit a feature request for additional completion framework support