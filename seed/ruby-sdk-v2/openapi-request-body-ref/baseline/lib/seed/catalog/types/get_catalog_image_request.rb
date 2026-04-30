# frozen_string_literal: true

module Seed
  module Catalog
    module Types
      class GetCatalogImageRequest < Internal::Types::Model
        field :image_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
