# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicateTypes < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithDuplicateTypesZero }
      member -> { Seed::Types::UnionWithDuplicateTypesOne }
    end
  end
end
