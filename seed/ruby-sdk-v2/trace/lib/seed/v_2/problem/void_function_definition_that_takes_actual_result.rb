# frozen_string_literal: true

module Seed
    module Types
        # The generated signature will include an additional param, actualResult
        class VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
            field :additional_parameters, Internal::Types::Array[Seed::V2::Problem::Parameter], optional: false, nullable: false
            field :code, Seed::V2::Problem::FunctionImplementationForMultipleLanguages, optional: false, nullable: false

    end
end
