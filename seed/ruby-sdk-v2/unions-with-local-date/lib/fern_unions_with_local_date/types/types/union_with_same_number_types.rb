# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Types
    module Types
      class UnionWithSameNumberTypes < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "POSITIVE_INT"
        member -> { Integer }, key: "NEGATIVE_INT"
        member -> { Integer }, key: "ANY_NUMBER"
      end
    end
  end
end
