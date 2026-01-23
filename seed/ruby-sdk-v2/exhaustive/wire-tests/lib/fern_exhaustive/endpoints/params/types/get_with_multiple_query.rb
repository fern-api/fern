# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Params
      module Types
        class GetWithMultipleQuery < Internal::Types::Model
          field :query, -> { String }, optional: false, nullable: false
          field :number, -> { Integer }, optional: false, nullable: false
        end
      end
    end
  end
end
