# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class TestCaseFunction < Internal::Types::Model
            extend Seed::Internal::Types::Union

            discriminant :type

            member lambda {
              Seed::V2::V3::Problem::Types::TestCaseWithActualResultImplementation
            }, key: "WITH_ACTUAL_RESULT"
            member -> { Seed::V2::V3::Problem::Types::VoidFunctionDefinition }, key: "CUSTOM"
          end
        end
      end
    end
  end
end
