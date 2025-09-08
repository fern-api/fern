# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class GetFunctionSignatureRequest < Internal::Types::Model
          field :function_signature, lambda {
            Seed::V2::Problem::Types::FunctionSignature
          }, optional: false, nullable: false
        end
      end
    end
  end
end
