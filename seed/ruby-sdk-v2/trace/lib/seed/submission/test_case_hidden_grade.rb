
module Seed
    module Types
        class TestCaseHiddenGrade < Internal::Types::Model
            field :passed, Internal::Types::Boolean, optional: false, nullable: false
        end
    end
end
