# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Outer union where one variant is an object containing a nested union field.
      # Tests that the deserializer correctly handles transitive union deserialization.
      class OuterNestedUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }

        member -> { Seed::Union::Types::WrapperObject }
      end
    end
  end
end
