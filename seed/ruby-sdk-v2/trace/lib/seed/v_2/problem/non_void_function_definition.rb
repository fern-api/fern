
module Seed
    module Types
        class NonVoidFunctionDefinition < Internal::Types::Model
            field :signature, Seed::v_2::problem::NonVoidFunctionSignature, optional: false, nullable: false
            field :code, Seed::v_2::problem::FunctionImplementationForMultipleLanguages, optional: false, nullable: false

    end
end
