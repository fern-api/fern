# frozen_string_literal: true

module Seed
  module EndpointsPut
    module Types
      class EndpointsPutAddRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
