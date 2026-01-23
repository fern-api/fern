# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class SubmissionTypeState < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::TestSubmissionState }, key: "TEST"
        member -> { FernTrace::Submission::Types::WorkspaceSubmissionState }, key: "WORKSPACE"
      end
    end
  end
end
