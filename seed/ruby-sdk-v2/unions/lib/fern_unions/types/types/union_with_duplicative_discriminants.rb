# frozen_string_literal: true

module FernUnions
  module Types
    module Types
      class UnionWithDuplicativeDiscriminants < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Types::Types::FirstItemType }, key: "FIRST_ITEM_TYPE"
        member -> { FernUnions::Types::Types::SecondItemType }, key: "SECOND_ITEM_TYPE"
      end
    end
  end
end
