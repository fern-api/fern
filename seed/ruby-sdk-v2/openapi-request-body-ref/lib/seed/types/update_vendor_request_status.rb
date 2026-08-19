# frozen_string_literal: true

module Seed
  module Types
    module UpdateVendorRequestStatus
      extend Seed::Internal::Types::Enum

      ACTIVE = "ACTIVE"
      INACTIVE = "INACTIVE"
    end
  end
end
