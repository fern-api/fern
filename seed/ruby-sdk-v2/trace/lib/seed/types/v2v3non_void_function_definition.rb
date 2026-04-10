# frozen_string_literal: true

module Seed
  module Types
    class V2V3NonVoidFunctionDefinition < Internal::Types::Model
      field :signature, -> { Seed::Types::V2V3NonVoidFunctionSignature }, optional: false, nullable: false
      field :code, -> { Seed::Types::V2V3FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
    end
  end
end
