# frozen_string_literal: true

module Seed
  module Types
    class TorU < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::T }
      member -> { Seed::Types::U }
    end
  end
end
