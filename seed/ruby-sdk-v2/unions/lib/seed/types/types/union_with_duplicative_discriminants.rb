# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithDuplicativeDiscriminants < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Types::Types::FirstItemType }, key: "FIRST_ITEM_TYPE"
        member -> { Seed::Types::Types::SecondItemType }, key: "SECOND_ITEM_TYPE"
      end
    end
  end
end
