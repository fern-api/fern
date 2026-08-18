# frozen_string_literal: true

require_relative "lib/seed/version"
require_relative "custom.gemspec"

# NOTE: A handful of these fields are required as part of the Ruby specification.
#       You can change them here or overwrite them in the custom gemspec file.
Gem::Specification.new do |spec|
  spec.name = "fern_any-auth"
  spec.authors = ["Seed"]
  spec.version = Seed::VERSION
  spec.summary = "Ruby client library for the Seed API"
  spec.description = "The Seed Ruby library provides convenient access to the Seed API from Ruby."
  spec.required_ruby_version = ">= 3.3.0"
  spec.metadata["rubygems_mfa_required"] = "true"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  # When the gem is built outside a git checkout (e.g. generated output), fall back to
  # globbing the filesystem.
  gemspec = File.basename(__FILE__)
  tracked_files = begin
    IO.popen(%w[git ls-files -z], chdir: __dir__, err: IO::NULL) do |ls|
      ls.readlines("\x0", chomp: true)
    end
  rescue SystemCallError
    []
  end || []
  if tracked_files.empty?
    tracked_files = Dir.chdir(__dir__) do
      Dir.glob("{lib,exe,sig}/**/*", File::FNM_DOTMATCH).select { |f| File.file?(f) } +
        Dir.glob("*").select { |f| File.file?(f) }
    end
  end
  spec.files = tracked_files.reject do |f|
    (f == gemspec) ||
      f.start_with?(*%w[bin/ test/ spec/ features/ .git appveyor Gemfile])
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
  spec.add_dependency "base64"
  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html

  # Load custom gemspec configuration if it exists
  custom_gemspec_file = File.join(__dir__, "custom.gemspec.rb")
  add_custom_gemspec_data(spec) if File.exist?(custom_gemspec_file)
end
