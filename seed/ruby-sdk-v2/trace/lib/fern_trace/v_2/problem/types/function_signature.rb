# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class FunctionSignature < Internal::Types::Model
          extend FernTrace::Internal::Types::Union

          discriminant :type

          member -> { FernTrace::V2::Problem::Types::VoidFunctionSignature }, key: "VOID"
          member -> { FernTrace::V2::Problem::Types::NonVoidFunctionSignature }, key: "NON_VOID"
          member -> { FernTrace::V2::Problem::Types::VoidFunctionSignatureThatTakesActualResult }, key: "VOID_THAT_TAKES_ACTUAL_RESULT"
        end
      end
    end
  end
end
