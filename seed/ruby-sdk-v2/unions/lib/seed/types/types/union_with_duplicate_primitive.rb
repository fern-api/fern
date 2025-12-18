# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithDuplicatePrimitive < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "integer1"
        member -> { Integer }, key: "integer2"
        member -> { String }, key: "string1"
        member -> { String }, key: "string2"
      end
    end
  end
end
