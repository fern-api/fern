# frozen_string_literal: true

# Custom gemspec configuration file
# This file is automatically loaded by the main gemspec file
# You can modify this file to add custom metadata, dependencies, or other gemspec configurations
# The 'spec' variable is available in this context from the main gemspec file

def add_custom_gemspec_data(spec)
  # Example custom configurations (uncomment and modify as needed)

  # spec.authors = ["Your name"]
  # spec.email = ["your.email@example.com"]
  # spec.homepage = "https://github.com/your-org/seed-ruby"
  # spec.license = "Your license"

  # Add custom dependencies
  # spec.add_dependency "your dependency", "~> your version"

  # Add development dependencies
  # spec.add_development_dependency "your development dependency", "~> your version"

  # Add custom metadata
  # spec.metadata = {
  #     "changelog_uri" => "https://github.com/your-org/seed-ruby/blob/main/CHANGELOG.md",
  #     "documentation_uri" => "https://rubydoc.info/gems/seed",
  #     "homepage_uri" => "https://github.com/your-org/seed-ruby",
  #     "source_code_uri" => "https://github.com/your-org/seed-ruby"
  # }

  # Add custom files or directories
  # spec.files += Dir["your path"]

  # Add custom executables
  # spec.executables << "your-custom-command"

  # Add custom require paths
  # spec.require_paths << "your path"

  # You can also add conditional logic based on environment
  # if ENV["Your environment variable"]
  #     spec.add_development_dependency "your development dependency", "~> 1.6"
  # end
end
