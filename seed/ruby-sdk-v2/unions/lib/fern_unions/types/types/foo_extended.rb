# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class FooExtended < Internal::Types::Model
        field :age, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
