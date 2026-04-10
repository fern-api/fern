# frozen_string_literal: true

module Seed
  module Types
    class Shape < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::ShapeZero }
      member -> { Seed::Types::ShapeOne }
    end
  end
end
