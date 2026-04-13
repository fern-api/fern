# frozen_string_literal: true

module Seed
  module Nullableoptional
    module Types
      class NullableOptionalGetNotificationSettingsRequest < Internal::Types::Model
        field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"
      end
    end
  end
end
