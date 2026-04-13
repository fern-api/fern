# frozen_string_literal: true

module Seed
  module Types
    class ShapeZero < Internal::Types::Model
      field :type, -> { Seed::Types::ShapeZeroType }, optional: false, nullable: false
    end
  end
end
