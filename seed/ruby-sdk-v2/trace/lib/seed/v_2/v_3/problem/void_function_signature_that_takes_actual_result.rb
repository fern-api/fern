# frozen_string_literal: true

module Seed
    module Types
        class VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::V2::V3::Problem::Parameter], optional: false, nullable: false
            field :actual_result_type, Seed::Commons::VariableType, optional: false, nullable: false

    end
end
