
module Seed
    module Types
        class TestCaseExpects < Internal::Types::Model
            field :expected_stdout, , optional: true, nullable: false
        end
    end
end
