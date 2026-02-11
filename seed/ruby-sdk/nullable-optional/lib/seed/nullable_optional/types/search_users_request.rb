# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class SearchUsersRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
        field :department, -> { String }, optional: false, nullable: true
        field :role, -> { String }, optional: true, nullable: false
        field :is_active, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "isActive"
      end
    end
  end
end
