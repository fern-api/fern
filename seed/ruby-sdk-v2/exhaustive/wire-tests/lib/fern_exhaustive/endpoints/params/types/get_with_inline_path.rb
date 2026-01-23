# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Params
      module Types
        class GetWithInlinePath < Internal::Types::Model
          field :param, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
