# frozen_string_literal: true

module Seed
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
