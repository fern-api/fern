# frozen_string_literal: true

module Seed
    module Types
        class GetBasicSolutionFileRequest < Internal::Types::Model
            field :method_name, String, optional: false, nullable: false
            field :signature, Seed::V2::V3::Problem::NonVoidFunctionSignature, optional: false, nullable: false

    end
end
