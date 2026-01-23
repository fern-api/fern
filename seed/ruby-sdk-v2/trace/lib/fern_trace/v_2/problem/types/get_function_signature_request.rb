# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class GetFunctionSignatureRequest < Internal::Types::Model
          field :function_signature, -> { FernTrace::V2::Problem::Types::FunctionSignature }, optional: false, nullable: false, api_name: "functionSignature"
        end
      end
    end
  end
end
