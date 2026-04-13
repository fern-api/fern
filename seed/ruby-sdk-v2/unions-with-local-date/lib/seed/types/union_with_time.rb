# frozen_string_literal: true

module Seed
  module Types
    class UnionWithTime < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithTimeValue }, key: "VALUE"
      member -> { Seed::Types::UnionWithTimeDate }, key: "DATE"
      member -> { Seed::Types::UnionWithTimeDatetime }, key: "DATETIME"
    end
  end
end
