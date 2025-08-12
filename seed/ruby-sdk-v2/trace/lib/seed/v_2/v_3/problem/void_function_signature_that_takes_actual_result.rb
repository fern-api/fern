
module Seed
    module Types
        class VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
            field :parameters, , optional: false, nullable: false
            field :actual_result_type, , optional: false, nullable: false
        end
    end
end
