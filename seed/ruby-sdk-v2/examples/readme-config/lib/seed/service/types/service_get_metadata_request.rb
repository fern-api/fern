# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServiceGetMetadataRequest < Internal::Types::Model
        field :shallow, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :tag, -> { String }, optional: true, nullable: false
        field :api_version, -> { String }, optional: false, nullable: false, api_name: "X-API-Version"
      end
    end
  end
end
