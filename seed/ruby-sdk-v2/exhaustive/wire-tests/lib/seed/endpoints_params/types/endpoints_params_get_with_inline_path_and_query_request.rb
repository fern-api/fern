# frozen_string_literal: true

module Seed
  module EndpointsParams
    module Types
      class EndpointsParamsGetWithInlinePathAndQueryRequest < Internal::Types::Model
        field :param, -> { String }, optional: false, nullable: false
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
