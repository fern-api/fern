# frozen_string_literal: true

module FernTrace
  module Admin
    module Types
      class Test < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { Internal::Types::Boolean }, key: "AND"
        member -> { Internal::Types::Boolean }, key: "OR"
      end
    end
  end
end
