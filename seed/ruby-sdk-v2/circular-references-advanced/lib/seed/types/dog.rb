# frozen_string_literal: true

module Seed
  module Types
    class Dog < Internal::Types::Model
      field :fruit, -> { Seed::Types::Fruit }, optional: false, nullable: false
    end
  end
end
