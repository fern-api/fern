# frozen_string_literal: true

module Seed
  module Types
    class UnionWithoutKeyOne < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithoutKeyOneType }, optional: false, nullable: false
    end
  end
end
