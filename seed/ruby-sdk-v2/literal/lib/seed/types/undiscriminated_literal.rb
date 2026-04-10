# frozen_string_literal: true

module Seed
  module Types
    class UndiscriminatedLiteral < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { String }
      member -> { Seed::Types::UndiscriminatedLiteralOne }
      member -> { Seed::Types::UndiscriminatedLiteralTwo }
      member -> { Internal::Types::Boolean }
    end
  end
end
