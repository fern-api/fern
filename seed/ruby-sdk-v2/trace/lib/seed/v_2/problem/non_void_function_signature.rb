
module Seed
    module Types
        class NonVoidFunctionSignature < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::v_2::problem::Parameter], optional: false, nullable: false
            field :return_type, Seed::commons::VariableType, optional: false, nullable: false

    end
end
