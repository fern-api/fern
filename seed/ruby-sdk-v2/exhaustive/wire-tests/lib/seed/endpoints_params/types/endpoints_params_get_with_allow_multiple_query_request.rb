# frozen_string_literal: true

module Seed
  module EndpointsParams
    module Types
      class EndpointsParamsGetWithAllowMultipleQueryRequest < Internal::Types::Model
        field :query, -> { String }, optional: true, nullable: false
        field :number, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
