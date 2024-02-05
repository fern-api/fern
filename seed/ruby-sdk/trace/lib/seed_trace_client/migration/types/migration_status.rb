# frozen_string_literal: true

module SeedTraceClient
  module Migration
    # @type [MIGRATION_STATUS]
    MIGRATION_STATUS = { running: "RUNNING", failed: "FAILED", finished: "FINISHED" }.freeze
  end
end
