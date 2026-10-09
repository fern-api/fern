# frozen_string_literal: true

module Seed
  module Types
    class PlantBase < Internal::Types::Model
      field :species, -> { String }, optional: false, nullable: false

      field :family, -> { String }, optional: false, nullable: false

      field :genus, -> { String }, optional: false, nullable: false

      field :common_name, -> { String }, optional: true, nullable: false, api_name: "commonName"

      field :watering_frequency, -> { Seed::Types::PlantBaseWateringFrequency }, optional: true, nullable: false, api_name: "wateringFrequency"
    end
  end
end
