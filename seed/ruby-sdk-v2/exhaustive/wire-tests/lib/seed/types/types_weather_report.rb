# frozen_string_literal: true

module Seed
  module Types
    module TypesWeatherReport
      extend Seed::Internal::Types::Enum

      SUNNY = "SUNNY"
      CLOUDY = "CLOUDY"
      RAINING = "RAINING"
      SNOWING = "SNOWING"
    end
  end
end
