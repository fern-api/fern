# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicativeDiscriminants < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithDuplicativeDiscriminantsZero }
      member -> { Seed::Types::UnionWithDuplicativeDiscriminantsOne }
    end
  end
end
