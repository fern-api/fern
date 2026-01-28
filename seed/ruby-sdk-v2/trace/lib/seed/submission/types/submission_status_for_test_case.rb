# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionStatusForTestCase < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::TestCaseResultWithStdout }, key: "GRADED"
        member -> { Seed::Submission::Types::TestCaseGrade }, key: "GRADED_V_2"
        member -> { Seed::Submission::Types::TracedTestCase }, key: "TRACED"
      end
    end
  end
end
