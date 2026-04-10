# frozen_string_literal: true

module Seed
  module Types
    class TypesAnimalOne < Internal::Types::Model
      field :animal, -> { Seed::Types::TypesAnimalOneAnimal }, optional: false, nullable: false
    end
  end
end
