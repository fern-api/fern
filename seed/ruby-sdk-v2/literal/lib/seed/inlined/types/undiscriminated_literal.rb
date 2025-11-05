# frozen_string_literal: true

module Seed
  module Inlined
    module Types
      class UndiscriminatedLiteral < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
        member -> { String }
        member -> { String }
        member -> { Internal::Types::Boolean }
        member -> { Internal::Types::Boolean }
        member -> { Internal::Types::Boolean }
      end
    end
  end
end
