# frozen_string_literal: true

module SeedExamplesClient
  module Types
    # @type [Hash{String => String}]
    MIGRATION_STATUS = { running: "RUNNING", failed: "FAILED", finished: "FINISHED" }.frozen
  end
end
