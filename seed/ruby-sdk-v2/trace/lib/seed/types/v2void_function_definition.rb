# frozen_string_literal: true

module Seed
  module Types
    class V2VoidFunctionDefinition < Internal::Types::Model
      field :parameters, -> { Internal::Types::Array[Seed::Types::V2Parameter] }, optional: false, nullable: false
      field :code, -> { Seed::Types::V2FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
    end
  end
end
