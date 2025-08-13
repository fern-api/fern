
module Seed
    module Types
        class GetBasicSolutionFileRequest < Internal::Types::Model
            field :method_name, String, optional: false, nullable: false
            field :signature, Seed::v_2::v_3::problem::NonVoidFunctionSignature, optional: false, nullable: false

    end
end
