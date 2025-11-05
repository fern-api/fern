# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Test object with nullable enums, unions, and arrays
      class ComplexProfile < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :nullable_role, lambda {
          Seed::NullableOptional::Types::UserRole
        }, optional: false, nullable: true, api_name: "nullableRole"
        field :optional_role, lambda {
          Seed::NullableOptional::Types::UserRole
        }, optional: true, nullable: false, api_name: "optionalRole"
        field :optional_nullable_role, lambda {
          Seed::NullableOptional::Types::UserRole
        }, optional: true, nullable: false, api_name: "optionalNullableRole"
        field :nullable_status, lambda {
          Seed::NullableOptional::Types::UserStatus
        }, optional: false, nullable: true, api_name: "nullableStatus"
        field :optional_status, lambda {
          Seed::NullableOptional::Types::UserStatus
        }, optional: true, nullable: false, api_name: "optionalStatus"
        field :optional_nullable_status, lambda {
          Seed::NullableOptional::Types::UserStatus
        }, optional: true, nullable: false, api_name: "optionalNullableStatus"
        field :nullable_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: false, nullable: true, api_name: "nullableNotification"
        field :optional_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: true, nullable: false, api_name: "optionalNotification"
        field :optional_nullable_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: true, nullable: false, api_name: "optionalNullableNotification"
        field :nullable_search_result, lambda {
          Seed::NullableOptional::Types::SearchResult
        }, optional: false, nullable: true, api_name: "nullableSearchResult"
        field :optional_search_result, lambda {
          Seed::NullableOptional::Types::SearchResult
        }, optional: true, nullable: false, api_name: "optionalSearchResult"
        field :nullable_array, lambda {
          Internal::Types::Array[String]
        }, optional: false, nullable: true, api_name: "nullableArray"
        field :optional_array, lambda {
          Internal::Types::Array[String]
        }, optional: true, nullable: false, api_name: "optionalArray"
        field :optional_nullable_array, lambda {
          Internal::Types::Array[String]
        }, optional: true, nullable: false, api_name: "optionalNullableArray"
        field :nullable_list_of_nullables, lambda {
          Internal::Types::Array[String]
        }, optional: false, nullable: true, api_name: "nullableListOfNullables"
        field :nullable_map_of_nullables, lambda {
          Internal::Types::Hash[String, Seed::NullableOptional::Types::Address]
        }, optional: false, nullable: true, api_name: "nullableMapOfNullables"
        field :nullable_list_of_unions, lambda {
          Internal::Types::Array[Seed::NullableOptional::Types::NotificationMethod]
        }, optional: false, nullable: true, api_name: "nullableListOfUnions"
        field :optional_map_of_enums, lambda {
          Internal::Types::Hash[String, Seed::NullableOptional::Types::UserRole]
        }, optional: true, nullable: false, api_name: "optionalMapOfEnums"
      end
    end
  end
end
