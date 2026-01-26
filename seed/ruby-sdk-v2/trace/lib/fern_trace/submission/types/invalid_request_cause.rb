# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class InvalidRequestCause < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::SubmissionIdNotFound }, key: "SUBMISSION_ID_NOT_FOUND"
        member -> { FernTrace::Submission::Types::CustomTestCasesUnsupported }, key: "CUSTOM_TEST_CASES_UNSUPPORTED"
        member -> { FernTrace::Submission::Types::UnexpectedLanguageError }, key: "UNEXPECTED_LANGUAGE"
      end
    end
  end
end
