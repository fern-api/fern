
module Seed
    module Types
        # The generated signature will include an additional param, actualResult
        class VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
            field :additional_parameters, Internal::Types::Array[Seed::v_2::problem::Parameter], optional: false, nullable: false
            field :code, Seed::v_2::problem::FunctionImplementationForMultipleLanguages, optional: false, nullable: false
        end
    end
end
