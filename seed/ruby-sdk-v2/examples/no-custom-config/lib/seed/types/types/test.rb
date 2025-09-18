# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Test < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Internal::Types::Boolean }, key: "AND"
        member -> { Internal::Types::Boolean }, key: "OR"
      end
    end
  end
end
