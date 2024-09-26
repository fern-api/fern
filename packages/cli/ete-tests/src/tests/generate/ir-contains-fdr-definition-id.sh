#!/bin/bash

# Check if a file name is provided
if [ $# -eq 0 ]; then
    echo "Error: No file provided"
    echo "Usage: $0 <json_file>"
    exit 1
fi

# Store the file name
file="$1"

# Check if the file exists
if [ ! -f "$file" ]; then
    echo "Error: File '$file' not found"
    exit 1
fi

# Use jq to check if "fdrApiDefinitionId" key exists
if cat "$file" | jq 'has("fdrApiDefinitionId")' | grep -q true; then
    echo "Success: 'fdrApiDefinitionId' key found in $file"
    exit 0
else
    echo "Failure: 'fdrApiDefinitionId' key not found in $file"
    exit 1
fi