# frozen_string_literal: true

module Seed
  module Types
    class TypesMixedType < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Integer }
      member -> { Internal::Types::Boolean }
      member -> { String }
      member -> { Internal::Types::Array[String] }
    end
  end
end
