# frozen_string_literal: true

module Seed
  module Types
    class V2GetFunctionSignatureRequest < Internal::Types::Model
      field :function_signature, -> { Seed::Types::V2FunctionSignature }, optional: false, nullable: false, api_name: "functionSignature"
    end
  end
end
