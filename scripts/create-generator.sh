#!/bin/bash

# TODO: Add generation of this: https://github.com/fern-api/fern/pull/4034

# Change to the root directory of the project
cd "$(dirname "$0")/.." || { echo "Failed to change to root directory"; exit 1; }

# Prompt user for a name
read -p "Enter the language name (e.g. 'Swift', 'Rust', etc): " new_name
echo "🌿 Setting up a new generator for $new_name!"

# Store the original name for later use
original_name="$new_name"

# Convert new_name to lowercase and replace spaces/dashes with underscores
new_name=$(echo "$new_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')

# Define paths
template_dir="generators/template"
new_dir="generators/$new_name"

# Check if the template directory exists
if [ ! -d "$template_dir" ]; then
  echo "Template directory 'generators/template' not found. Please make sure it exists."
  exit 1
fi

# Check if the new directory already exists
if [ -d "$new_dir" ]; then
  echo "Directory '$new_name' already exists. Please choose a different name."
  exit 1
fi

# Copy template directory to a new directory with the user-provided name
cp -r "$template_dir" "$new_dir"

# Function to recursively replace "LANGUAGE" in all files
replace_full_language_name() {
  local original_name="$1"
  find "$new_dir" -type f -exec sed -i '' -e "s/LANGUAGE/$original_name/g" {} +
}

# Call the function to replace "LANGUAGE" in all files within the new directory
replace_full_language_name "$original_name"

# Function to recursively replace "template" in all files and filenames
replace_language_name() {
  local directory="$1"
  local new_name="$2"

  # Replace in filenames first
  find "$directory" -depth -name "*template*" -execdir bash -c 'mv "$1" "${1//template/'"$new_name"'}"' _ {} \;

  # Replace in file contents
  find "$directory" -type f -exec sed -i '' -e "s/template/$new_name/g" {} +
}

# Call the function to replace "template" in all files and filenames within the new directory
replace_language_name "$new_dir" "$new_name"

echo "Directory '$new_name' created successfully at '$new_dir'"
cd "$new_dir/codegen"

echo "🌿 Install typescript dependencies"
pnpm install

echo "🌿 Running sample tests"
pnpm test -u

echo "🌿 Opening test result output"
file="./src/ast/__test__/__snapshots__/Language.test.ts.snap"

# Specify the full path to code (modify this based on your system)
code_path="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"

# Check if code is available at the specified path
if [ -x "$code_path" ]; then
  # Open in VSCode, reusing existing window if open
  "$code_path" --reuse-window "$file"
else
  echo "VSCode is not installed or not found."
  # Optionally, open in Finder if VSCode is not available
  open -R "$file"
fi

echo "🌿 New language generator created for $new_name!"
echo "Start building it at: $new_dir"