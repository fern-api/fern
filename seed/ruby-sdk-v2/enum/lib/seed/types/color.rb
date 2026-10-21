# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    module Color
      extend Seed::Internal::Types::Enum

      RED = "red"
      BLUE = "blue"
    end
  end
end
