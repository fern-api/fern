# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithDiscriminant < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO"
        member -> { FernUnionsWithLocalDate::Types::Types::Bar }, key: "BAR"
      end
    end
  end
end
