# frozen_string_literal: true

module Seed
  module Products
    module Types
      class GetProductsRequest < Internal::Types::Model
        field :region_id, -> { String }, optional: false, nullable: false, api_name: "regionId"

        field :product_id, -> { String }, optional: false, nullable: false, api_name: "productId"
      end
    end
  end
end
