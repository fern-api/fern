# frozen_string_literal: true

module SeedClient
  module Types
    # @type [Hash{String => String}] 
    MigrationStatus = { running: 'RUNNING', failed: 'FAILED', finished: 'FINISHED' }.frozen
  end
end