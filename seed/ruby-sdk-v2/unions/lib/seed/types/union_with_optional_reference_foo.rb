# frozen_string_literal: true

module Seed
  module Types
    class UnionWithOptionalReferenceFoo < Internal::Types::Model
      field :value, -> { Seed::Types::Foo }, optional: true, nullable: false
    end
  end
end
