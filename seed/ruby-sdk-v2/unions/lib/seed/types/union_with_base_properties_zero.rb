# frozen_string_literal: true

module Seed
  module Types
    class UnionWithBasePropertiesZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithBasePropertiesZeroType }, optional: false, nullable: false
      field :value, -> { Integer }, optional: true, nullable: false
    end
  end
end
