# frozen_string_literal: true

module V2
    module Types
        class VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
            field :parameters, Array, optional: true, nullable: true
            field :actual_result_type, VariableType, optional: true, nullable: true
        end
    end
end
