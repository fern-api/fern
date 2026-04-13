# frozen_string_literal: true

module Seed
  module Types
    class Test < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::TestAnd }, key: "AND"
      member -> { Seed::Types::TestOr }, key: "OR"
    end
  end
end
