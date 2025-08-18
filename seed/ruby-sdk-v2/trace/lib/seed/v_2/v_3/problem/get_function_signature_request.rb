# frozen_string_literal: true

module Seed
    module Types
        class GetFunctionSignatureRequest < Internal::Types::Model
            field :function_signature, Seed::V2::V3::Problem::FunctionSignature, optional: false, nullable: false

    end
end
