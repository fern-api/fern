# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithLiteral < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "FERN"
      end
    end
  end
end
