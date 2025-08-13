
module Seed
    module Types
        class UnexpectedLanguageError < Internal::Types::Model
            field :expected_language, Seed::commons::Language, optional: false, nullable: false
            field :actual_language, Seed::commons::Language, optional: false, nullable: false

    end
end
