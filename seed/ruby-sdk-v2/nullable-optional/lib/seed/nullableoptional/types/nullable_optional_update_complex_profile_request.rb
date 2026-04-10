# frozen_string_literal: true

module Seed
  module Nullableoptional
    module Types
      class NullableOptionalUpdateComplexProfileRequest < Internal::Types::Model
        field :profile_id, -> { String }, optional: false, nullable: false, api_name: "profileId"
        field :nullable_role, -> { Seed::Types::UserRole }, optional: true, nullable: false, api_name: "nullableRole"
        field :nullable_status, -> { Seed::Types::UserStatus }, optional: true, nullable: false, api_name: "nullableStatus"
        field :nullable_notification, -> { Seed::Types::NotificationMethod }, optional: true, nullable: false, api_name: "nullableNotification"
        field :nullable_search_result, -> { Seed::Types::SearchResult }, optional: true, nullable: false, api_name: "nullableSearchResult"
        field :nullable_array, -> { Internal::Types::Array[String] }, optional: true, nullable: false, api_name: "nullableArray"
      end
    end
  end
end
