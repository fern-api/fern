# frozen_string_literal: true

module FernExamples
  module Service
    module Types
      class GetMetadataRequest < Internal::Types::Model
        field :shallow, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :tag, -> { String }, optional: true, nullable: false
        field :x_api_version, -> { String }, optional: false, nullable: false, api_name: "X-API-Version"
      end
    end
  end
end
