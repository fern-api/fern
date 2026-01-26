# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      module UserRole
        extend FernNullableOptional::Internal::Types::Enum

        ADMIN = "ADMIN"
        USER = "USER"
        GUEST = "GUEST"
        MODERATOR = "MODERATOR"
      end
    end
  end
end
