# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      class UpdateComplexProfileRequest < Internal::Types::Model
        field :profile_id, -> { String }, optional: false, nullable: false, api_name: "profileId"
        field :nullable_role, -> { FernNullableOptional::NullableOptional::Types::UserRole }, optional: true, nullable: false, api_name: "nullableRole"
        field :nullable_status, -> { FernNullableOptional::NullableOptional::Types::UserStatus }, optional: true, nullable: false, api_name: "nullableStatus"
        field :nullable_notification, -> { FernNullableOptional::NullableOptional::Types::NotificationMethod }, optional: true, nullable: false, api_name: "nullableNotification"
        field :nullable_search_result, -> { FernNullableOptional::NullableOptional::Types::SearchResult }, optional: true, nullable: false, api_name: "nullableSearchResult"
        field :nullable_array, -> { Internal::Types::Array[String] }, optional: true, nullable: false, api_name: "nullableArray"
      end
    end
  end
end
