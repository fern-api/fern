# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithDuplicateTypes < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO_1"
        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO_2"
      end
    end
  end
end
