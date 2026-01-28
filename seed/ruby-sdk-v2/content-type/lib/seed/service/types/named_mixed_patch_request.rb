# frozen_string_literal: true

module Seed
  module Service
    module Types
      class NamedMixedPatchRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :app_id, -> { String }, optional: true, nullable: false, api_name: "appId"
        field :instructions, -> { String }, optional: false, nullable: true
        field :active, -> { Internal::Types::Boolean }, optional: false, nullable: true
      end
    end
  end
end
