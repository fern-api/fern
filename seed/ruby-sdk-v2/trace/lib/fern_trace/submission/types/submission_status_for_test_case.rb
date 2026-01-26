# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class SubmissionStatusForTestCase < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::TestCaseResultWithStdout }, key: "GRADED"
        member -> { FernTrace::Submission::Types::TestCaseGrade }, key: "GRADED_V_2"
        member -> { FernTrace::Submission::Types::TracedTestCase }, key: "TRACED"
      end
    end
  end
end
