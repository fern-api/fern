# frozen_string_literal: true

module Seed
  module Types
    class SubmissionStatusForTestCase < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::SubmissionStatusForTestCaseZero }
      member -> { Seed::Types::SubmissionStatusForTestCaseType }
      member -> { Seed::Types::SubmissionStatusForTestCaseTwo }
    end
  end
end
