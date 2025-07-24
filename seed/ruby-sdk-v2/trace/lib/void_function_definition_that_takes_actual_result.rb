# frozen_string_literal: true

module V2
    module Types
        # The generated signature will include an additional param, actualResult
        class VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
            field :additional_parameters, Array, optional: true, nullable: true
            field :code, FunctionImplementationForMultipleLanguages, optional: true, nullable: true
        end
    end
end
