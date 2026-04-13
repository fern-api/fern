# frozen_string_literal: true

module Seed
  module Nullableoptional
    module Types
      class NullableOptionalFilterByRoleRequest < Internal::Types::Model
        field :role, -> { Seed::Types::UserRole }, optional: false, nullable: false
        field :status, -> { Seed::Types::UserStatus }, optional: true, nullable: false
        field :secondary_role, -> { Seed::Types::UserRole }, optional: true, nullable: false, api_name: "secondaryRole"
      end
    end
  end
end
