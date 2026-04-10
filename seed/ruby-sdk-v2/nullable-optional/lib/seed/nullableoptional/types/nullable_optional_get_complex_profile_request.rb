# frozen_string_literal: true

module Seed
  module Nullableoptional
    module Types
      class NullableOptionalGetComplexProfileRequest < Internal::Types::Model
        field :profile_id, -> { String }, optional: false, nullable: false, api_name: "profileId"
      end
    end
  end
end
