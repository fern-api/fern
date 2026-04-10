# frozen_string_literal: true

module Seed
  module Types
    class UnionWithBasePropertiesOne < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithBasePropertiesOneType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
