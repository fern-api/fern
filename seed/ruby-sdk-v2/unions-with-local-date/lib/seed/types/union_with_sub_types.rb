# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSubTypes < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithSubTypesZero }
      member -> { Seed::Types::UnionWithSubTypesOne }
    end
  end
end
