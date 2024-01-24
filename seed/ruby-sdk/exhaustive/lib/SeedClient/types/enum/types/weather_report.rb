# frozen_string_literal: true

module SeedClient
  module Types
    module Enum
      # @type [Hash{String => String}]
      WEATHER_REPORT = { sunny: "SUNNY", cloudy: "CLOUDY", raining: "RAINING", snowing: "SNOWING" }.frozen
    end
  end
end
