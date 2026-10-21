# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Types
    module Types
      module MigrationStatus
        extend Seed::Internal::Types::Enum

        RUNNING = "RUNNING"
        FAILED = "FAILED"
        FINISHED = "FINISHED"
      end
    end
  end
end
