# frozen_string_literal: true

module Seed
  module Plants
    module Types
      class GetPlantsRequest < Internal::Types::Model
        field :plant_id, -> { String }, optional: false, nullable: false, api_name: "plantId"
      end
    end
  end
end
