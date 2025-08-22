# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithOptionalTime < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "DATE"
        member -> { String }, key: "DATETIME"
      end
    end
  end
end
