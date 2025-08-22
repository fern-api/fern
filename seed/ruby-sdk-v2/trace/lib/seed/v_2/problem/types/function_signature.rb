# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class FunctionSignature < Internal::Types::Model
          extend Seed::Internal::Types::Union

          discriminant :type

          member -> { Seed::V2::Problem::Types::VoidFunctionSignature }, key: "VOID"
          member -> { Seed::V2::Problem::Types::NonVoidFunctionSignature }, key: "NON_VOID"
          member lambda {
            Seed::V2::Problem::Types::VoidFunctionSignatureThatTakesActualResult
          }, key: "VOID_THAT_TAKES_ACTUAL_RESULT"
        end
      end
    end
  end
end
