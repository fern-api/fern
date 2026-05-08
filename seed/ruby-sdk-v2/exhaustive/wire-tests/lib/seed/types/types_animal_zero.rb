# frozen_string_literal: true

module Seed
  module Types
    class TypesAnimalZero < Internal::Types::Model
      field :animal, -> { Seed::Types::TypesAnimalZeroAnimal }, optional: false, nullable: false
    end
  end
end
