# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithOptionalTime < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "date"
        member -> { String }, key: "datetime"
      end
    end
  end
end
