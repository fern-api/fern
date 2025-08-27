#!/bin/bash

# Script to validate CLI and all generators in parallel and collect errors
# Usage: ./validate-all-changelogs.sh

set -e

# Run all validations in parallel and collect errors
generators=(
    fastapi
    pydantic
    python-sdk
    go-sdk
    ruby-sdk
    postman
    openapi
    java-sdk
    java-model
    java-spring
    ts-express
    csharp-sdk
    csharp-model
    php-sdk
    php-model
    rust-sdk
    rust-model
    swift-sdk
)

# Create temporary files for each generator's output
temp_dir=$(mktemp -d)
error_files=()

echo "🚀 Starting validation for cli..."

cli_error_file="$temp_dir/cli.log"
cli_exit_file="$temp_dir/cli.exit"
error_files+=("$cli_error_file")

echo "  Starting validation for cli..."

# Run CLI validation in background, redirecting both stdout and stderr
(pnpm seed validate cli --log-level debug > "$cli_error_file" 2>&1; echo $? > "$cli_exit_file") &

echo "🚀 Starting validation for ${#generators[@]} generators..."

for generator in "${generators[@]}"; do
    error_file="$temp_dir/${generator}.log"
    exit_file="$temp_dir/${generator}.exit"
    error_files+=("$error_file")
    
    echo "  Starting validation for $generator..."
    
    # Run validation in background, redirecting both stdout and stderr
    (pnpm seed validate generator "$generator" --log-level debug > "$error_file" 2>&1; echo $? > "$exit_file") &
done

echo "⏳ Waiting for all validations to complete..."

# Wait for all background jobs to complete
wait

echo "📊 Collecting results..."

# Check results and collect errors
failed_changelogs=()

# Check CLI results
if [ -f "$cli_exit_file" ]; then
    cli_exit_code=$(cat "$cli_exit_file")
    if [ "$cli_exit_code" -ne 0 ]; then
        failed_changelogs+=("cli")
        echo "❌ cli changelog failed"
    else
        echo "✅ cli passed"
    fi
else
    failed_changelogs+=("cli")
    echo "❌ cli changelog failed to start or crashed"
fi

# Check generator results
for generator in "${generators[@]}"; do
    exit_file="$temp_dir/${generator}.exit"
    error_file="$temp_dir/${generator}.log"
    
    if [ -f "$exit_file" ]; then
        exit_code=$(cat "$exit_file")
        if [ "$exit_code" -ne 0 ]; then
            failed_changelogs+=("$generator")
            echo "❌ $generator changelog failed (exit code: $exit_code)"
        else
            echo "✅ $generator passed"
        fi
    else
        failed_changelogs+=("$generator")
        echo "❌ $generator changelog crashed (no exit file, but log exists)"
    fi
done

# Fail the script if any validation failed
if [ ${#failed_changelogs[@]} -gt 0 ]; then
    echo "❌ The following changelogs failed validation:"
    printf '  - %s\n' "${failed_changelogs[@]}"
    echo ""
    echo "📋 Error details:"
    echo ""
    
    # Show CLI error logs if it failed
    if [[ " ${failed_changelogs[@]} " =~ " cli " ]]; then
        echo "❌ CLI changelog error:"
        cat "$cli_error_file"
        echo ""
    fi
    
    # Show generator error logs
    for generator in "${generators[@]}"; do
        if [[ " ${failed_changelogs[@]} " =~ " $generator " ]]; then
            exit_file="$temp_dir/${generator}.exit"
            error_file="$temp_dir/${generator}.log"
            
            echo "❌ $generator changelog error:"
            if [ -f "$exit_file" ]; then
                # Check if log contains "fail" (case insensitive) and show from that point
                cat "$error_file"
            else
                if [ -f "$error_file" ]; then
                    cat "$error_file"
                else
                    echo "  No log file found"
                fi
            fi
            echo ""
        fi
    done

    echo "❌ The following changelogs failed validation:"
    printf '  - %s\n' "${failed_changelogs[@]}"
    echo ""

    # Clean up temp files
    rm -rf "$temp_dir"

    exit 1
fi

# Clean up temp files
rm -rf "$temp_dir"

echo "🎉 All changelogs passed validation!"
