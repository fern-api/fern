
module Seed
    module Types
        class FunctionImplementationForMultipleLanguages < Internal::Types::Model
            field :code_by_language, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::problem::FunctionImplementation], optional: false, nullable: false
        end
    end
end
