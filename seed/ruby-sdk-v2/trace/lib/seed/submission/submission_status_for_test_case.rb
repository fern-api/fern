# frozen_string_literal: true

module Seed
    module Types
        class SubmissionStatusForTestCase < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::TestCaseResultWithStdout }, key: "GRADED"
            member -> { Seed::Submission::TestCaseGrade }, key: "GRADED_V_2"
            member -> { Seed::Submission::TracedTestCase }, key: "TRACED"
    end
end
