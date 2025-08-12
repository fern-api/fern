
module Seed
    module Types
        class TestCaseNonHiddenGrade < Internal::Types::Model
            field :passed, , optional: false, nullable: false
            field :actual_result, , optional: true, nullable: false
            field :exception, , optional: true, nullable: false
            field :stdout, , optional: false, nullable: false
        end
    end
end
