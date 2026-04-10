# frozen_string_literal: true

module Seed
  module Types
    class ShapeOne < Internal::Types::Model
      field :type, -> { Seed::Types::ShapeOneType }, optional: false, nullable: false
    end
  end
end
