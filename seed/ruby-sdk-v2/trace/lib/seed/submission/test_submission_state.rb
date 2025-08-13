# frozen_string_literal: true

module Seed
    module Types
        class TestSubmissionState < Internal::Types::Model
            field :problem_id, String, optional: false, nullable: false
            field :default_test_cases, Internal::Types::Array[Seed::Commons::TestCase], optional: false, nullable: false
            field :custom_test_cases, Internal::Types::Array[Seed::Commons::TestCase], optional: false, nullable: false
            field :status, Seed::Submission::TestSubmissionStatus, optional: false, nullable: false

    end
end
