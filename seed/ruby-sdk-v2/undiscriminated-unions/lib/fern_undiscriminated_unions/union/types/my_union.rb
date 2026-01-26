# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      # Several different types are accepted.
      class MyUnion < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { String }
        member -> { Internal::Types::Array[String] }
        member -> { Integer }
        member -> { Internal::Types::Array[Integer] }
        member -> { Internal::Types::Array[Internal::Types::Array[Integer]] }
        member -> { Internal::Types::Array[String] }
      end
    end
  end
end
