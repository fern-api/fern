# frozen_string_literal: true

module Seed
    module Types
        class NonVoidFunctionSignature < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::V2::V3::Problem::Parameter], optional: false, nullable: false
            field :return_type, Seed::Commons::VariableType, optional: false, nullable: false

    end
end
