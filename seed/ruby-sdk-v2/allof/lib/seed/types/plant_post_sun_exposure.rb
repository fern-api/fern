# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    module PlantPostSunExposure
      extend Seed::Internal::Types::Enum

      FULL = "full"
      PARTIAL = "partial"
      SHADE = "shade"
    end
  end
end
