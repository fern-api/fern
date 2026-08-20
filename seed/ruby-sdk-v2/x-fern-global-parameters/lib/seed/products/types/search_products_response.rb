# frozen_string_literal: true

module Seed
  module Products
    module Types
      class SearchProductsResponse < Internal::Types::Model
        field :results, -> { Internal::Types::Array[::Seed::Types::Product] }, optional: true, nullable: false
      end
    end
  end
end
