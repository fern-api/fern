# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class AssertCorrectnessCheck < Internal::Types::Model
            extend Seed::Internal::Types::Union

            discriminant :type

            member -> { Seed::V2::V3::Problem::Types::DeepEqualityCorrectnessCheck }, key: "DEEP_EQUALITY"
            member -> { Seed::V2::V3::Problem::Types::VoidFunctionDefinitionThatTakesActualResult }, key: "CUSTOM"
          end
        end
      end
    end
  end
end
