# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSameNumberTypes < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithSameNumberTypesPositiveInt }, key: "POSITIVE_INT"
      member -> { Seed::Types::UnionWithSameNumberTypesNegativeInt }, key: "NEGATIVE_INT"
      member -> { Seed::Types::UnionWithSameNumberTypesAnyNumber }, key: "ANY_NUMBER"
    end
  end
end
