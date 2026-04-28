# frozen_string_literal: true

module Seed
  module Types
    class CreatePlantWithSchemaRequest < Internal::Types::Model
      field :name, -> { String }, optional: true, nullable: false

      field :species, -> { String }, optional: true, nullable: false
    end
  end
end
