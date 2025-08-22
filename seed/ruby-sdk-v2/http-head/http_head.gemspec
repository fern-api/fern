# frozen_string_literal: true

# require_relative "lib/http_head/version"

Gem::Specification.new do |spec|
  spec.name = "http_head"
  spec.version = "0.0.1" # TODO: http_head::VERSION
  spec.authors = ["Fern"]
  spec.email = ["support@buildwithfern.com"]
  spec.summary = "Ruby client library for the http_head API"
  # spec.description = "The http_head Ruby library provides convenient access to the http_head API from Ruby."
  spec.homepage = "https://github.com/fern-demo/square-ruby-sdk" # TODO
  spec.license = "MIT" # TODO
  spec.required_ruby_version = ">= 3.1.0"
  # spec.metadata["homepage_uri"] = "https://github.com/fern-demo/square-ruby-sdk" # TODO
  # spec.metadata["source_code_uri"] = "https://github.com/fern-demo/square-ruby-sdk" # TODO
  # spec.metadata["changelog_uri"] = "https://github.com/fern-demo/square-ruby-sdk/blob/master/CHANGELOG.md" # TODO

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  gemspec = File.basename(__FILE__)
  spec.files = IO.popen(%w[git ls-files -z], chdir: __dir__, err: IO::NULL) do |ls|
    ls.readlines("\x0", chomp: true).reject do |f|
      (f == gemspec) ||
        f.start_with?(*%w[bin/ test/ spec/ features/ .git appveyor Gemfile])
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  # Uncomment to register a new dependency of your gem
  # spec.add_dependency "example-gem", "~> 1.0"

  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html
  spec.metadata["rubygems_mfa_required"] = "true"
end
