# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithSingleElement < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO"
      end
    end
  end
end
