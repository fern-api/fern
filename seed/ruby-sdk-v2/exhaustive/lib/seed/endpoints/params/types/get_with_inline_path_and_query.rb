# frozen_string_literal: true

module Seed
  module Endpoints
    module Params
      module Types
        class GetWithInlinePathAndQuery < Internal::Types::Model
          field :param, -> { String }, optional: false, nullable: false
          field :query, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
