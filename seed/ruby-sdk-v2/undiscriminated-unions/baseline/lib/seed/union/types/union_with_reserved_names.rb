# frozen_string_literal: true

module Seed
  module Union
    module Types
      # Tests that union members named 'Type' or 'Value' don't collide with internal properties
      class UnionWithReservedNames < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { String }
        member -> { String }
        member -> { String }
      end
    end
  end
end
