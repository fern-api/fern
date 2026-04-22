# frozen_string_literal: true

module Seed
  module Service
    module Types
      class GetResourceRequest < Internal::Types::Model
        field :resource_id, -> { String }, optional: false, nullable: false, api_name: "resourceId"
        field :include_metadata, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :format, -> { String }, optional: false, nullable: false
      end
    end
  end
end
