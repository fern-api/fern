# frozen_string_literal: true

module Seed
  module Types
    # The generated signature will include an additional param, actualResult
    class V2V3VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
      field :additional_parameters, -> { Internal::Types::Array[Seed::Types::V2V3Parameter] }, optional: false, nullable: false, api_name: "additionalParameters"
      field :code, -> { Seed::Types::V2V3FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
    end
  end
end
