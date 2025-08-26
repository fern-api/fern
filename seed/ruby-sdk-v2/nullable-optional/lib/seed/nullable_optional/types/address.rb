# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Nested object for testing
      class Address < Internal::Types::Model
        field :street, -> { String }, optional: false, nullable: false
        field :city, -> { String }, optional: false, nullable: true
        field :state, -> { String }, optional: true, nullable: false
        field :zip_code, -> { String }, optional: false, nullable: false
        field :country, -> { String }, optional: true, nullable: false
      end
    end
  end
end
