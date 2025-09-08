# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Request body for testing deserialization of null values
      class DeserializationTestRequest < Internal::Types::Model
        field :required_string, -> { String }, optional: false, nullable: false
        field :nullable_string, -> { String }, optional: false, nullable: true
        field :optional_string, -> { String }, optional: true, nullable: false
        field :optional_nullable_string, -> { String }, optional: true, nullable: false
        field :nullable_enum, -> { Seed::NullableOptional::Types::UserRole }, optional: false, nullable: true
        field :optional_enum, -> { Seed::NullableOptional::Types::UserStatus }, optional: true, nullable: false
        field :nullable_union, -> { Seed::NullableOptional::Types::NotificationMethod }, optional: false, nullable: true
        field :optional_union, -> { Seed::NullableOptional::Types::SearchResult }, optional: true, nullable: false
        field :nullable_list, -> { Internal::Types::Array[String] }, optional: false, nullable: true
        field :nullable_map, -> { Internal::Types::Hash[String, Integer] }, optional: false, nullable: true
        field :nullable_object, -> { Seed::NullableOptional::Types::Address }, optional: false, nullable: true
        field :optional_object, -> { Seed::NullableOptional::Types::Organization }, optional: true, nullable: false
      end
    end
  end
end
