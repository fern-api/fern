# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      module UserStatus
        extend Seed::Internal::Types::Enum

        ACTIVE = "active"
        INACTIVE = "inactive"
        SUSPENDED = "suspended"
        DELETED = "deleted"
      end
    end
  end
end
