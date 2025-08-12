
module Seed
    module Types
        class TestSubmissionState < Internal::Types::Model
            field :problem_id, String, optional: false, nullable: false
            field :default_test_cases, Internal::Types::Array[Seed::commons::TestCase], optional: false, nullable: false
            field :custom_test_cases, Internal::Types::Array[Seed::commons::TestCase], optional: false, nullable: false
            field :status, Seed::submission::TestSubmissionStatus, optional: false, nullable: false
        end
    end
end
