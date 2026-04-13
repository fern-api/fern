# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDiscriminantFoo < Internal::Types::Model
      field :foo, -> { Seed::Types::Foo }, optional: true, nullable: false
    end
  end
end
