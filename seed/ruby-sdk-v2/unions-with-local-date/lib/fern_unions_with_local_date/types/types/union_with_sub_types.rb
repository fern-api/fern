# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithSubTypes < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Types::Types::Foo }, key: "FOO"
        member -> { FernUnionsWithLocalDate::Types::Types::FooExtended }, key: "FOO_EXTENDED"
      end
    end
  end
end
