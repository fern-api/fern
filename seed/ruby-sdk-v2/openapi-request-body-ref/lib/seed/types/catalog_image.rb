# frozen_string_literal: true

module Seed
  module Types
    class CatalogImage < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :caption, -> { String }, optional: true, nullable: false
      field :url, -> { String }, optional: true, nullable: false
      field :create_request, -> { Seed::Types::CreateCatalogImageRequest }, optional: true, nullable: false
    end
  end
end
