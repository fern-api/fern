# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class AssertCorrectnessCheck < Internal::Types::Model
          extend FernTrace::Internal::Types::Union

          discriminant :type

          member -> { FernTrace::V2::Problem::Types::DeepEqualityCorrectnessCheck }, key: "DEEP_EQUALITY"
          member -> { FernTrace::V2::Problem::Types::VoidFunctionDefinitionThatTakesActualResult }, key: "CUSTOM"
        end
      end
    end
  end
end
