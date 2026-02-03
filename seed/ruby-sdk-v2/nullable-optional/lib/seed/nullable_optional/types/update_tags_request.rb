# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class UpdateTagsRequest < Internal::Types::Model
        field :user_id, -> { String }, optional: false, nullable: false, api_name: "userId"
        field :tags, -> { Internal::Types::Array[String] }, optional: false, nullable: true
        field :categories, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :labels, -> { Internal::Types::Array[String] }, optional: true, nullable: false
      end
    end
  end
end
