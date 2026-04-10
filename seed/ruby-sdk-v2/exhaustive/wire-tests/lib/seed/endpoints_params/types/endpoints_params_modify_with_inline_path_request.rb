# frozen_string_literal: true

module Seed
  module EndpointsParams
    module Types
      class EndpointsParamsModifyWithInlinePathRequest < Internal::Types::Model
        field :param, -> { String }, optional: false, nullable: false
        field :body, -> { String }, optional: false, nullable: false
      end
    end
  end
end
