# frozen_string_literal: true

module FernUnions
  module Union
    module Types
      class Shape < Internal::Types::Model
        extend FernUnions::Internal::Types::Union

        discriminant :type

        member -> { FernUnions::Union::Types::Circle }, key: "CIRCLE"
        member -> { FernUnions::Union::Types::Square }, key: "SQUARE"
      end
    end
  end
end
