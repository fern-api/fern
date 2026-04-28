# frozen_string_literal: true

module Seed
  module Types
    class CreateCatalogImageRequest < Internal::Types::Model
      field :caption, -> { String }, optional: true, nullable: false
      field :catalog_object_id, -> { String }, optional: false, nullable: false
    end
  end
end
