
module Seed
    module Types
        class TestCaseResultWithStdout < Internal::Types::Model
            field :result, , optional: false, nullable: false
            field :stdout, , optional: false, nullable: false
        end
    end
end
