# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module NullableOptional
    module Types
      module UserRole
        extend Seed::Internal::Types::Enum

        ADMIN = "ADMIN"
        USER = "USER"
        GUEST = "GUEST"
        MODERATOR = "MODERATOR"
      end
    end
  end
end
