# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithPrimitive < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "integer"
        member -> { String }, key: "string"
      end
    end
  end
end
