# frozen_string_literal: true

module V2
    module Types
        class FunctionImplementationForMultipleLanguages < Internal::Types::Model
            field :code_by_language, Array, optional: true, nullable: true
        end
    end
end
