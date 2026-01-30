# frozen_string_literal: true

module Seed
  module Service
    module Types
      class GetUserRequest < Internal::Types::Model
        field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"
        field :fields, -> { String }, optional: true, nullable: false
        field :include_fields, -> { Internal::Types::Boolean }, optional: true, nullable: false
      end
    end
  end
end
