# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      # Tests that union members named 'Type' or 'Value' don't collide with internal properties
      class UnionWithReservedNames < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { String }
        member -> { String }
        member -> { String }
      end
    end
  end
end
