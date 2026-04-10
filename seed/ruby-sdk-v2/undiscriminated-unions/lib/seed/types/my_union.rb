# frozen_string_literal: true

module Seed
  module Types
    # Several different types are accepted.
    class MyUnion < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { String }
      member -> { Integer }
      member -> { Internal::Types::Array[Integer] }
      member -> { Internal::Types::Array[Internal::Types::Array[Integer]] }
      member -> { Internal::Types::Array[String] }
    end
  end
end
