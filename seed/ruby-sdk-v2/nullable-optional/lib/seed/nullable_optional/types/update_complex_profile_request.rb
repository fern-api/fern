# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class UpdateComplexProfileRequest < Internal::Types::Model
        field :profile_id, -> { String }, optional: false, nullable: false
        field :nullable_role, -> { Seed::NullableOptional::Types::UserRole }, optional: true, nullable: false
        field :nullable_status, -> { Seed::NullableOptional::Types::UserStatus }, optional: true, nullable: false
        field :nullable_notification, lambda {
          Seed::NullableOptional::Types::NotificationMethod
        }, optional: true, nullable: false
        field :nullable_search_result, lambda {
          Seed::NullableOptional::Types::SearchResult
        }, optional: true, nullable: false
        field :nullable_array, -> { Internal::Types::Array[String] }, optional: true, nullable: false
      end
    end
  end
end
