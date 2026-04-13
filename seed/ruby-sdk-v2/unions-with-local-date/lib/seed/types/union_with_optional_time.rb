# frozen_string_literal: true

module Seed
  module Types
    class UnionWithOptionalTime < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithOptionalTimeDate }, key: "DATE"
      member -> { Seed::Types::UnionWithOptionalTimeDatetime }, key: "DATETIME"
    end
  end
end
