# frozen_string_literal: true

module SeedTraceClient
  module Migration
    # @type [Hash{String => String}]
    MIGRATION_STATUS = { running: "RUNNING", failed: "FAILED", finished: "FINISHED" }.frozen
  end
end
