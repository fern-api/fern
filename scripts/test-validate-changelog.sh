temp_dir=$(mktemp -d)
(pnpm seed validate generator ruby-sdk --log-level debug > "$temp_dir/ruby-sdk.log" 2>&1; echo $? > "$temp_dir/ruby-sdk.exit") &
wait
echo "Exit file exists: $(ls -la $temp_dir/ruby-sdk.exit 2>/dev/null || echo 'NO')"
echo "Exit code: $(cat $temp_dir/ruby-sdk.exit 2>/dev/null || echo 'NO FILE')"
rm -rf $temp_dir