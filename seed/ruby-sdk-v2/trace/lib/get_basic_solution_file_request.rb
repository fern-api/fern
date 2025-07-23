# frozen_string_literal: true

module V2
    module Types
        class GetBasicSolutionFileRequest < Internal::Types::Model
            field :method_name, String, optional: true, nullable: true
            field :signature, NonVoidFunctionSignature, optional: true, nullable: true
        end
    end
end
