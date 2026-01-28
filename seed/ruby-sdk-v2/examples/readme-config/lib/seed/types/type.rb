# frozen_string_literal: true

module FernExamples
  module Types
    class Type < Internal::Types::Model
      extend FernExamples::Internal::Types::Union

      member -> { FernExamples::Types::BasicType }
      member -> { FernExamples::Types::ComplexType }
    end
  end
end
