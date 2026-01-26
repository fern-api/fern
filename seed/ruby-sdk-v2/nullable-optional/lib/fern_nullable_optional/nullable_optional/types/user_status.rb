# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      module UserStatus
        extend FernNullableOptional::Internal::Types::Enum

        ACTIVE = "active"
        INACTIVE = "inactive"
        SUSPENDED = "suspended"
        DELETED = "deleted"
      end
    end
  end
end
