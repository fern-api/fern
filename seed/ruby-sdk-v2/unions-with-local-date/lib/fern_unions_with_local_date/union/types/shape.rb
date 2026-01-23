# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Union
    module Types
      class Shape < Internal::Types::Model
        extend FernUnionsWithLocalDate::Internal::Types::Union

        discriminant :type

        member -> { FernUnionsWithLocalDate::Union::Types::Circle }, key: "CIRCLE"
        member -> { FernUnionsWithLocalDate::Union::Types::Square }, key: "SQUARE"
      end
    end
  end
end
