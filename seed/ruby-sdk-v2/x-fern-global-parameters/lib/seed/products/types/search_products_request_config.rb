# frozen_string_literal: true

module Seed
  module Products
    module Types
      class SearchProductsRequestConfig < Internal::Types::Model
        field :currency, -> { String }, optional: true, nullable: false

        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
