# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      # Request body for testing deserialization of null values
      class DeserializationTestRequest < Internal::Types::Model
        field :required_string, -> { String }, optional: false, nullable: false, api_name: "requiredString"
        field :nullable_string, -> { String }, optional: false, nullable: true, api_name: "nullableString"
        field :optional_string, -> { String }, optional: true, nullable: false, api_name: "optionalString"
        field :optional_nullable_string, -> { String }, optional: true, nullable: false, api_name: "optionalNullableString"
        field :nullable_enum, -> { FernNullableOptional::NullableOptional::Types::UserRole }, optional: false, nullable: true, api_name: "nullableEnum"
        field :optional_enum, -> { FernNullableOptional::NullableOptional::Types::UserStatus }, optional: true, nullable: false, api_name: "optionalEnum"
        field :nullable_union, -> { FernNullableOptional::NullableOptional::Types::NotificationMethod }, optional: false, nullable: true, api_name: "nullableUnion"
        field :optional_union, -> { FernNullableOptional::NullableOptional::Types::SearchResult }, optional: true, nullable: false, api_name: "optionalUnion"
        field :nullable_list, -> { Internal::Types::Array[String] }, optional: false, nullable: true, api_name: "nullableList"
        field :nullable_map, -> { Internal::Types::Hash[String, Integer] }, optional: false, nullable: true, api_name: "nullableMap"
        field :nullable_object, -> { FernNullableOptional::NullableOptional::Types::Address }, optional: false, nullable: true, api_name: "nullableObject"
        field :optional_object, -> { FernNullableOptional::NullableOptional::Types::Organization }, optional: true, nullable: false, api_name: "optionalObject"
      end
    end
  end
end
