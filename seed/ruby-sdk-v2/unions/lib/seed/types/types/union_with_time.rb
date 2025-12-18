# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithTime < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "value"
        member -> { String }, key: "date"
        member -> { String }, key: "datetime"
      end
    end
  end
end
