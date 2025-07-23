# frozen_string_literal: true

module V2
    module Types
        class GetFunctionSignatureResponse < Internal::Types::Model
            field :function_by_language, Array, optional: true, nullable: true
        end
    end
end
