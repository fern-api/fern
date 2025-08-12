
module Seed
    module Types
        # The generated signature will include an additional param, actualResult
        class VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
            field :additional_parameters, , optional: false, nullable: false
            field :code, , optional: false, nullable: false
        end
    end
end
