# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServiceGetResourceRequest < Internal::Types::Model
        field :resource_id, -> { String }, optional: false, nullable: false, api_name: "ResourceID"
      end
    end
  end
end
