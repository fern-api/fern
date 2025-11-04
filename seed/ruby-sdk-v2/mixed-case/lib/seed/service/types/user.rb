# frozen_string_literal: true

module Seed
  module Service
    module Types
      class User < Internal::Types::Model
        field :user_name, -> { String }, optional: false, nullable: false, api_name: "userName"
        field :metadata_tags, -> { Internal::Types::Array[String] }, optional: false, nullable: false
        field :extra_properties, lambda {
          Internal::Types::Hash[String, String]
        }, optional: false, nullable: false, api_name: "EXTRA_PROPERTIES"
      end
    end
  end
end
