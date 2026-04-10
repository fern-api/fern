# frozen_string_literal: true

module Seed
  module Types
    class UnionWithOptionalReferenceBar < Internal::Types::Model
      field :value, -> { Seed::Types::Bar }, optional: true, nullable: false
    end
  end
end
