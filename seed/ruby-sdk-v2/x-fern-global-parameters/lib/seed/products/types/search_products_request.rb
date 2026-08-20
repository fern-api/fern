# frozen_string_literal: true

module Seed
  module Products
    module Types
      class SearchProductsRequest < Internal::Types::Model
        field :region_id, -> { String }, optional: false, nullable: false, api_name: "regionId"

        field :query, -> { String }, optional: true, nullable: false

        field :config, -> { ::Seed::Products::Types::SearchProductsRequestConfig }, optional: true, nullable: false
      end
    end
  end
end
