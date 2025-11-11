# frozen_string_literal: true

module Seed
  module Types
    class Type < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::BasicType }
      member -> { Seed::Types::ComplexType }
    end
  end
end
