# frozen_string_literal: true

module FernTrace
  module Migration
    module Types
      module MigrationStatus
        extend FernTrace::Internal::Types::Enum

        RUNNING = "RUNNING"
        FAILED = "FAILED"
        FINISHED = "FINISHED"
      end
    end
  end
end
