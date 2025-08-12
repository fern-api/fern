
module Seed
    module Types
        class TestCaseNonHiddenGrade < Internal::Types::Model
            field :passed, Internal::Types::Boolean, optional: false, nullable: false
            field :actual_result, Seed::commons::VariableValue, optional: true, nullable: false
            field :exception, Seed::submission::ExceptionV2, optional: true, nullable: false
            field :stdout, String, optional: false, nullable: false
        end
    end
end
