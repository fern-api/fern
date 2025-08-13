
module Seed
    module Types
        class VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::v_2::problem::Parameter], optional: false, nullable: false
            field :actual_result_type, Seed::commons::VariableType, optional: false, nullable: false
        end
    end
end
