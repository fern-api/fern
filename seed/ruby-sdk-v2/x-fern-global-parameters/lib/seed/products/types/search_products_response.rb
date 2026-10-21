# frozen_string_literal: true

require_relative "../.."

module Seed
  module Products
    module Types
      class SearchProductsResponse < Internal::Types::Model
        field :results, -> { Internal::Types::Array[Seed::Types::Product] }, optional: true, nullable: false
      end
    end
  end
end
