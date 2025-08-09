# frozen_string_literal: true

require "rake/testtask"
require "rubocop/rake_task"

task default: %i[test rubocop]

Rake::TestTask.new do |t|
  t.pattern = "./test/**/test_*.rb"
end

RuboCop::RakeTask.new
