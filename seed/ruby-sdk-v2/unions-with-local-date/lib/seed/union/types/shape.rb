# frozen_string_literal: true

module Seed
  module Union
    module Types
      class Shape < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Union::Types::Circle }, key: "CIRCLE"
        member -> { Seed::Union::Types::Square }, key: "SQUARE"
      end
    end
  end
end
