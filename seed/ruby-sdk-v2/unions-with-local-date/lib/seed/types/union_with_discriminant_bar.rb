# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDiscriminantBar < Internal::Types::Model
      field :bar, -> { Seed::Types::Bar }, optional: true, nullable: false
    end
  end
end
