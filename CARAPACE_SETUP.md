# Fern CLI Auto-Completion with Carapace

This guide shows how to set up auto-completion for the Fern CLI using [carapace](https://github.com/rsteube/carapace).

## Quick Setup

1. **Install carapace**:
   ```bash
   # macOS (via Homebrew)
   brew install rsteube/tap/carapace

   # Or download from: https://github.com/rsteube/carapace/releases
   ```

2. **Install the Fern completion spec**:
   ```bash
   # Create carapace specs directory if it doesn't exist
   mkdir -p "$HOME/Library/Application Support/carapace/specs"

   # Copy the Fern completion spec to the correct location
   cp fern.carapace.yaml "$HOME/Library/Application Support/carapace/specs/fern.yaml"
   ```

3. **Configure your shell**:

   **For Zsh:**
   ```bash
   echo "source <(carapace _carapace)" >> ~/.zshrc
   source ~/.zshrc
   ```

   **For Bash:**
   ```bash
   echo "source <(carapace _carapace)" >> ~/.bashrc
   source ~/.bashrc
   ```

   **For Fish:**
   ```bash
   mkdir -p ~/.config/fish/completions
   carapace _carapace fish > ~/.config/fish/completions/_carapace.fish
   ```

## Usage

Once configured, you can use tab completion with all Fern CLI commands:

```bash
fern <TAB>                    # Shows: init, generate, check, format, etc.
fern docs <TAB>               # Shows: dev, broken-links
fern api <TAB>                # Shows: update
```

## Available Commands

The completion provides all main Fern CLI commands:

**Core Commands:**
- `init` - Initialize a Fern API
- `generate` - Generate all generators in the specified group
- `check` - Validates your Fern Definition. Logs errors.
- `format` - Formats your Fern Definition

**Development Commands:**
- `docs dev` - Run a local development server to preview your docs
- `docs broken-links` - Check for broken links in your docs
- `mock` - Starts a mock server for an API
- `test` - Runs tests with a mock server in the background

**Management Commands:**
- `login` - Log in to Fern via GitHub
- `logout` - Log out of Fern
- `upgrade` - Upgrades Fern CLI version in fern.config.json
- `downgrade` - Downgrades Fern CLI version in fern.config.json
- `self-update` - Updates the globally installed Fern CLI

**Generation Commands:**
- `ir` - Generate IR (Intermediate Representation)
- `export` - Export your API to an OpenAPI spec
- `jsonschema` - Generate JSON Schema for a specific type

## Troubleshooting

**Completions not working?**
1. Verify carapace is installed: `carapace --version`
2. Check the spec exists: `ls "$HOME/Library/Application Support/carapace/specs/fern.yaml"`
3. Ensure your shell sources carapace completions
4. Restart your shell or terminal
5. Verify carapace recognizes fern: `carapace --list | grep fern`

**Missing completions for new commands?**
- Update to the latest completion spec from the Fern repository
- Copy the updated `fern.carapace.yaml` file to the specs directory

**Schema validation errors?**
- The completion spec follows the official carapace schema: https://carapace.sh/schemas/command.json
- Ensure the YAML file starts with the schema reference line

## Technical Details

**Carapace Spec Location:**
- macOS: `~/Library/Application Support/carapace/specs/`
- Linux: `~/.local/share/carapace/specs/`

**Schema Reference:**
The completion spec includes the schema reference for proper validation:
```yaml
# yaml-language-server: $schema=https://carapace.sh/schemas/command.json
```

**Completion Generation:**
The completion spec is generated from the CLI command definitions in `packages/cli/cli/src/carapace-completion.ts` and follows the official carapace specification format.

## Future Enhancements

The basic command completion is working. Future improvements could include:
- Flag completion with proper value suggestions
- File path completion for file-related options
- Dynamic completion for API names and generator groups
- Context-aware completions based on project structure

This provides a solid foundation for Fern CLI auto-completion that works across all major shells via carapace.