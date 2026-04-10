# frozen_string_literal: true

module Seed
  module Types
    # The generated signature will include an additional param, actualResult
    class V2VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
      field :additional_parameters, -> { Internal::Types::Array[Seed::Types::V2Parameter] }, optional: false, nullable: false, api_name: "additionalParameters"
      field :code, -> { Seed::Types::V2FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
    end
  end
end
