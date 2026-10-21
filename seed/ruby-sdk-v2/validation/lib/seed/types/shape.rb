# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    module Shape
      extend Seed::Internal::Types::Enum

      SQUARE = "SQUARE"
      CIRCLE = "CIRCLE"
      TRIANGLE = "TRIANGLE"
    end
  end
end
