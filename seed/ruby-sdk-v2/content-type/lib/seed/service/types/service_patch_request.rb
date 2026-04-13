# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServicePatchRequest < Internal::Types::Model
        field :application, -> { String }, optional: false, nullable: true
        field :require_auth, -> { Internal::Types::Boolean }, optional: false, nullable: true
      end
    end
  end
end
