# frozen_string_literal: true

module Seed
  module Types
    class UpdatePlantRequest < Internal::Types::Model
      field :plant_id, -> { String }, optional: false, nullable: false, api_name: "plantId"
      field :body, -> { Object }, optional: false, nullable: false
    end
  end
end
