# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      class FilterByRoleRequest < Internal::Types::Model
        field :role, -> { FernNullableOptional::NullableOptional::Types::UserRole }, optional: false, nullable: true
        field :status, -> { FernNullableOptional::NullableOptional::Types::UserStatus }, optional: true, nullable: false
        field :secondary_role, -> { FernNullableOptional::NullableOptional::Types::UserRole }, optional: true, nullable: false, api_name: "secondaryRole"
      end
    end
  end
end
