# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithSameStringTypes < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "customFormat"
        member -> { String }, key: "regularString"
        member -> { String }, key: "patternString"
      end
    end
  end
end
