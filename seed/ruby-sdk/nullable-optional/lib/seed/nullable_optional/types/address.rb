# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Nested object for testing
      class Address < Internal::Types::Model
        field :street, -> { String }, optional: false, nullable: false
        field :city, -> { String }, optional: false, nullable: true
        field :state, -> { String }, optional: true, nullable: false
        field :zip_code, -> { String }, optional: false, nullable: false, api_name: "zipCode"
        field :country, -> { String }, optional: true, nullable: false
        field :building_id, -> { String }, optional: false, nullable: false, api_name: "buildingId"
        field :tenant_id, -> { String }, optional: false, nullable: false, api_name: "tenantId"
      end
    end
  end
end
