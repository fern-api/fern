# frozen_string_literal: true

module Seed
  module Types
    class V2NonVoidFunctionSignature < Internal::Types::Model
      field :parameters, -> { Internal::Types::Array[Seed::Types::V2Parameter] }, optional: false, nullable: false
      field :return_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "returnType"
    end
  end
end
