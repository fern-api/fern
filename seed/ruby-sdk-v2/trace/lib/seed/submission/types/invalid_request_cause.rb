# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class InvalidRequestCause < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::SubmissionIdNotFound }, key: "SUBMISSION_ID_NOT_FOUND"
        member -> { Seed::Submission::Types::CustomTestCasesUnsupported }, key: "CUSTOM_TEST_CASES_UNSUPPORTED"
        member -> { Seed::Submission::Types::UnexpectedLanguageError }, key: "UNEXPECTED_LANGUAGE"
      end
    end
  end
end
