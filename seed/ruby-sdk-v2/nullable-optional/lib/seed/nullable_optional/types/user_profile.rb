# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Test object with nullable and optional fields
      class UserProfile < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :username, -> { String }, optional: false, nullable: false
        field :nullable_string, -> { String }, optional: false, nullable: true
        field :nullable_integer, -> { Integer }, optional: false, nullable: true
        field :nullable_boolean, -> { Internal::Types::Boolean }, optional: false, nullable: true
        field :nullable_date, -> { String }, optional: false, nullable: true
        field :nullable_object, -> { Seed::NullableOptional::Types::Address }, optional: false, nullable: true
        field :nullable_list, -> { Internal::Types::Array[String] }, optional: false, nullable: true
        field :nullable_map, -> { Internal::Types::Hash[String, String] }, optional: false, nullable: true
        field :optional_string, -> { String }, optional: true, nullable: false
        field :optional_integer, -> { Integer }, optional: true, nullable: false
        field :optional_boolean, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :optional_date, -> { String }, optional: true, nullable: false
        field :optional_object, -> { Seed::NullableOptional::Types::Address }, optional: true, nullable: false
        field :optional_list, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :optional_map, -> { Internal::Types::Hash[String, String] }, optional: true, nullable: false
        field :optional_nullable_string, -> { String }, optional: true, nullable: false
        field :optional_nullable_object, -> { Seed::NullableOptional::Types::Address }, optional: true, nullable: false
      end
    end
  end
end
