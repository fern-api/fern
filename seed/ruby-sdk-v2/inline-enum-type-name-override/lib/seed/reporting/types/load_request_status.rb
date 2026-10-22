# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Reporting
    module Types
      module LoadRequestStatus
        extend Seed::Internal::Types::Enum

        ACTIVE = "active"
        INACTIVE = "inactive"
        PENDING = "pending"
      end
    end
  end
end
