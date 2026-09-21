# frozen_string_literal: true

require "bundler/gem_tasks"
require "minitest/test_task"

Minitest::TestTask.create

require "rubocop/rake_task"

RuboCop::RakeTask.new

task default: %i[test]

task lint: %i[rubocop]

# Run only the custom test file
Minitest::TestTask.create(:customtest) do |t|
  t.libs << "test"
  t.test_globs = ["test/custom.test.rb"]
end
