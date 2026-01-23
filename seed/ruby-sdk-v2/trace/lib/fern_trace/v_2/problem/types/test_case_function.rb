# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class TestCaseFunction < Internal::Types::Model
          extend FernTrace::Internal::Types::Union

          discriminant :type

          member -> { FernTrace::V2::Problem::Types::TestCaseWithActualResultImplementation }, key: "WITH_ACTUAL_RESULT"
          member -> { FernTrace::V2::Problem::Types::VoidFunctionDefinition }, key: "CUSTOM"
        end
      end
    end
  end
end
