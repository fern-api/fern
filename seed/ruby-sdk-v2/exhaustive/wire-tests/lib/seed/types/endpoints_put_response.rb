# frozen_string_literal: true

module Seed
  module Types
    class EndpointsPutResponse < Internal::Types::Model
      field :errors, -> { Internal::Types::Array[Seed::Types::EndpointsError] }, optional: true, nullable: false
    end
  end
end
