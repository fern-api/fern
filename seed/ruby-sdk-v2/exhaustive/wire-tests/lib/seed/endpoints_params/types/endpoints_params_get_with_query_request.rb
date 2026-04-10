# frozen_string_literal: true

module Seed
  module EndpointsParams
    module Types
      class EndpointsParamsGetWithQueryRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
        field :number, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
