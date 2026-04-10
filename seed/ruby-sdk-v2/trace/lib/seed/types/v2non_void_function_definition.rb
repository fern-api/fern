# frozen_string_literal: true

module Seed
  module Types
    class V2NonVoidFunctionDefinition < Internal::Types::Model
      field :signature, -> { Seed::Types::V2NonVoidFunctionSignature }, optional: false, nullable: false
      field :code, -> { Seed::Types::V2FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
    end
  end
end
