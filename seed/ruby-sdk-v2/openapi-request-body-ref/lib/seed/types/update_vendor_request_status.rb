# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    module UpdateVendorRequestStatus
      extend Seed::Internal::Types::Enum

      ACTIVE = "ACTIVE"
      INACTIVE = "INACTIVE"
    end
  end
end
