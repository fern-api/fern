# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class UpdateComplexProfileRequest < Internal::Types::Model
        field :profile_id, -> { String }, optional: false, nullable: false, api_name: "profileId"
        field :nullable_role, lambda {
          Seed::NullableOptional::Types::UserRole
        }, optional: true, nullable: false, api_name: "nullableRole"
        field :nullable_status, lambda {
          Seed::NullableOptional::Types::UserStatus
        }, optional: true, nullable: false, api_name: "nullableStatus"
        field :nullable_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: true, nullable: false, api_name: "nullableNotification"
        field :nullable_search_result, lambda {
          Seed::NullableOptional::Types::SearchResult
        }, optional: true, nullable: false, api_name: "nullableSearchResult"
        field :nullable_array, lambda {
          Internal::Types::Array[String]
        }, optional: true, nullable: false, api_name: "nullableArray"
      end
    end
  end
end
