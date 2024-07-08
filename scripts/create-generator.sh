#!/bin/bash

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

# Function to recursively replace "FULL_LANGUAGE_NAME" in all files
replace_full_language_name() {
  original_name="$1"
  find "$new_dir" -type f -exec sed -i '' -e "s/FULL_LANGUAGE_NAME/$original_name/g" {} +
}

# Call the function to replace "FULL_LANGUAGE_NAME" in all files within the new directory
replace_full_language_name "$original_name"

# Function to recursively replace "LANGUAGE_NAME" in all files
replace_language_name() {
  find "$1" -type f -exec sed -i '' -e "s/LANGUAGE_NAME/$new_name/g" {} +
}

# Call the function to replace "LANGUAGE_NAME" in all files within the new directory
replace_language_name "$new_dir"

echo "Directory '$new_name' created successfully at '$new_dir'"
cd "$new_dir/codegen"

echo "🌿 Install typescript dependencies"
yarn install

echo "🌿 Running sample tests"
yarn test

echo "🌿 New language generator created for $new_name!"
echo "Start building it at: $new_dir"