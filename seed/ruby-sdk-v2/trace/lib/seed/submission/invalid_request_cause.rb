# frozen_string_literal: true

module Seed
    module Types
        class InvalidRequestCause < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::SubmissionIdNotFound }, key: "SUBMISSION_ID_NOT_FOUND"
            member -> { Seed::Submission::CustomTestCasesUnsupported }, key: "CUSTOM_TEST_CASES_UNSUPPORTED"
            member -> { Seed::Submission::UnexpectedLanguageError }, key: "UNEXPECTED_LANGUAGE"
    end
end
