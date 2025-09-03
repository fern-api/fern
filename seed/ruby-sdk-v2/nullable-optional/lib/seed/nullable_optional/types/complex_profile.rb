# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Test object with nullable enums, unions, and arrays
      class ComplexProfile < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :nullable_role, -> { Seed::NullableOptional::Types::UserRole }, optional: false, nullable: true
        field :optional_role, -> { Seed::NullableOptional::Types::UserRole }, optional: true, nullable: false
        field :optional_nullable_role, -> { Seed::NullableOptional::Types::UserRole }, optional: true, nullable: false
        field :nullable_status, -> { Seed::NullableOptional::Types::UserStatus }, optional: false, nullable: true
        field :optional_status, -> { Seed::NullableOptional::Types::UserStatus }, optional: true, nullable: false
        field :optional_nullable_status, lambda {
          Seed::NullableOptional::Types::UserStatus
        }, optional: true, nullable: false
        field :nullable_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: false, nullable: true
        field :optional_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: true, nullable: false
        field :optional_nullable_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: true, nullable: false
        field :nullable_search_result, lambda {
          Seed::NullableOptional::Types::SearchResult
        }, optional: false, nullable: true
        field :optional_search_result, lambda {
          Seed::NullableOptional::Types::SearchResult
        }, optional: true, nullable: false
        field :nullable_array, -> { Internal::Types::Array[String] }, optional: false, nullable: true
        field :optional_array, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :optional_nullable_array, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :nullable_list_of_nullables, -> { Internal::Types::Array[String] }, optional: false, nullable: true
        field :nullable_map_of_nullables, lambda {
          Internal::Types::Hash[String, Seed::NullableOptional::Types::Address]
        }, optional: false, nullable: true
        field :nullable_list_of_unions, lambda {
          Internal::Types::Array[Seed::NullableOptional::Types::NotificationMethod]
        }, optional: false, nullable: true
        field :optional_map_of_enums, lambda {
          Internal::Types::Hash[String, Seed::NullableOptional::Types::UserRole]
        }, optional: true, nullable: false
      end
    end
  end
end
