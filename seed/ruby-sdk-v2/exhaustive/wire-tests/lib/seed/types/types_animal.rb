# frozen_string_literal: true

module Seed
  module Types
    class TypesAnimal < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::TypesAnimalZero }
      member -> { Seed::Types::TypesAnimalOne }
    end
  end
end
