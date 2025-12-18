# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithSameNumberTypes < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "positiveInt"
        member -> { Integer }, key: "negativeInt"
        member -> { Integer }, key: "anyNumber"
      end
    end
  end
end
