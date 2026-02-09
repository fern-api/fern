# frozen_string_literal: true

source "https://rubygems.org"

gemspec

group :test, :development do
  gem "rake", "~> 13.0"

  gem "minitest", "~> 5.16"
  gem "minitest-rg"

  gem "rubocop", "~> 1.21"
  gem "rubocop-minitest"

  gem "pry"

  gem "webmock"
end

# Load custom Gemfile configuration if it exists
custom_gemfile = File.join(__dir__, "Gemfile.custom")
eval_gemfile(custom_gemfile) if File.exist?(custom_gemfile)
