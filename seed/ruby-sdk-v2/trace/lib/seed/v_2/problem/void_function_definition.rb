
module Seed
    module Types
        class VoidFunctionDefinition < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::v_2::problem::Parameter], optional: false, nullable: false
            field :code, Seed::v_2::problem::FunctionImplementationForMultipleLanguages, optional: false, nullable: false

    end
end
