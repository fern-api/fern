# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class GetFunctionSignatureRequest < Internal::Types::Model
            field :function_signature, lambda {
              Seed::V2::V3::Problem::Types::FunctionSignature
            }, optional: false, nullable: false, api_name: "functionSignature"
          end
        end
      end
    end
  end
end
