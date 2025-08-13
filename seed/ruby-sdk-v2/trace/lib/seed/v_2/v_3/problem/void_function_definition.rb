# frozen_string_literal: true

module Seed
    module Types
        class VoidFunctionDefinition < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::V2::V3::Problem::Parameter], optional: false, nullable: false
            field :code, Seed::V2::V3::Problem::FunctionImplementationForMultipleLanguages, optional: false, nullable: false

    end
end
