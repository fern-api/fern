# frozen_string_literal: true

module V2
    module Types
        class VoidFunctionDefinition < Internal::Types::Model
            field :parameters, Array, optional: true, nullable: true
            field :code, FunctionImplementationForMultipleLanguages, optional: true, nullable: true
        end
    end
end
