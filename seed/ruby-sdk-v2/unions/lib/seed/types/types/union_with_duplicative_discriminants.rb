# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithDuplicativeDiscriminants < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::FirstItemType }, key: "firstItemType"
        member -> { Seed::Types::Types::SecondItemType }, key: "secondItemType"
      end
    end
  end
end
