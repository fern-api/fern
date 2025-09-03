# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class FilterByRoleRequest < Internal::Types::Model
        field :role, -> { Seed::NullableOptional::Types::UserRole }, optional: false, nullable: true
        field :status, -> { Seed::NullableOptional::Types::UserStatus }, optional: true, nullable: false
        field :secondary_role, -> { Seed::NullableOptional::Types::UserRole }, optional: true, nullable: false
      end
    end
  end
end
