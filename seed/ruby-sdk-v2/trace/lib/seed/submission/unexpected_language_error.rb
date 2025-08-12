
module Seed
    module Types
        class UnexpectedLanguageError < Internal::Types::Model
            field :expected_language, , optional: false, nullable: false
            field :actual_language, , optional: false, nullable: false
        end
    end
end
