# frozen_string_literal: true

module Seed
  module Types
    class PlantPost < Internal::Types::Model
      field :sun_exposure, -> { Seed::Types::PlantPostSunExposure }, optional: false, nullable: false, api_name: "sunExposure"

      field :planted_at, -> { String }, optional: true, nullable: false, api_name: "plantedAt"

      field :soil_type, -> { String }, optional: true, nullable: false, api_name: "soilType"

      field :common_name, -> { String }, optional: true, nullable: false, api_name: "commonName"

      field :watering_frequency, -> { Seed::Types::PlantBaseWateringFrequency }, optional: true, nullable: false, api_name: "wateringFrequency"

      field :species, -> { String }, optional: false, nullable: false

      field :family, -> { String }, optional: false, nullable: false

      field :genus, -> { String }, optional: false, nullable: false
    end
  end
end
