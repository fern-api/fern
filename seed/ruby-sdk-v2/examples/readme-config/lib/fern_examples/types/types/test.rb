# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Test < Internal::Types::Model
        extend FernExamples::Internal::Types::Union

        discriminant :type

        member -> { Internal::Types::Boolean }, key: "AND"
        member -> { Internal::Types::Boolean }, key: "OR"
      end
    end
  end
end
