# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSameNumberTypesAnyNumber < Internal::Types::Model
      field :value, -> { Integer }, optional: true, nullable: false
    end
  end
end
