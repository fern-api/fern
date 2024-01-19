# frozen_string_literal: true

module SeedClient
  module Types
    module Enum
      # @type [Hash{String => String}] 
      WeatherReport = {
 sunny: 'SUNNY',
 cloudy: 'CLOUDY',
 raining: 'RAINING',
 snowing: 'SNOWING'
}.frozen
    end
  end
end