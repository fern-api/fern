
module Seed
    module Types
        class GetFunctionSignatureResponse < Internal::Types::Model
            field :function_by_language, Internal::Types::Hash[Seed::commons::Language, String], optional: false, nullable: false
        end
    end
end
