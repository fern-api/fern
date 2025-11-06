# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Test object with nullable and optional fields
      class UserProfile < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :username, -> { String }, optional: false, nullable: false
        field :nullable_string, -> { String }, optional: false, nullable: true, api_name: "nullableString"
        field :nullable_integer, -> { Integer }, optional: false, nullable: true, api_name: "nullableInteger"
        field :nullable_boolean, lambda {
          Internal::Types::Boolean
        }, optional: false, nullable: true, api_name: "nullableBoolean"
        field :nullable_date, -> { String }, optional: false, nullable: true, api_name: "nullableDate"
        field :nullable_object, lambda {
          Seed::NullableOptional::Types::Address
        }, optional: false, nullable: true, api_name: "nullableObject"
        field :nullable_list, lambda {
          Internal::Types::Array[String]
        }, optional: false, nullable: true, api_name: "nullableList"
        field :nullable_map, lambda {
          Internal::Types::Hash[String, String]
        }, optional: false, nullable: true, api_name: "nullableMap"
        field :optional_string, -> { String }, optional: true, nullable: false, api_name: "optionalString"
        field :optional_integer, -> { Integer }, optional: true, nullable: false, api_name: "optionalInteger"
        field :optional_boolean, lambda {
          Internal::Types::Boolean
        }, optional: true, nullable: false, api_name: "optionalBoolean"
        field :optional_date, -> { String }, optional: true, nullable: false, api_name: "optionalDate"
        field :optional_object, lambda {
          Seed::NullableOptional::Types::Address
        }, optional: true, nullable: false, api_name: "optionalObject"
        field :optional_list, lambda {
          Internal::Types::Array[String]
        }, optional: true, nullable: false, api_name: "optionalList"
        field :optional_map, lambda {
          Internal::Types::Hash[String, String]
        }, optional: true, nullable: false, api_name: "optionalMap"
        field :optional_nullable_string, lambda {
          String
        }, optional: true, nullable: false, api_name: "optionalNullableString"
        field :optional_nullable_object, lambda {
          Seed::NullableOptional::Types::Address
        }, optional: true, nullable: false, api_name: "optionalNullableObject"
      end
    end
  end
end
