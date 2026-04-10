# frozen_string_literal: true

module Seed
  module Types
    class UnionWithoutKeyZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithoutKeyZeroType }, optional: false, nullable: false
    end
  end
end
