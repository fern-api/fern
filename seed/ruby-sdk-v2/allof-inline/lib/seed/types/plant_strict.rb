# frozen_string_literal: true

module Seed
  module Types
    class PlantStrict < Internal::Types::Model
      field :species, -> { String }, optional: false, nullable: false

      field :family, -> { String }, optional: false, nullable: false

      field :genus, -> { String }, optional: false, nullable: false
    end
  end
end
