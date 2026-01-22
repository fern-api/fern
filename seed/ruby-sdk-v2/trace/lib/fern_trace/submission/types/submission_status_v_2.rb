# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class SubmissionStatusV2 < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::TestSubmissionStatusV2 }, key: "TEST"
        member -> { FernTrace::Submission::Types::WorkspaceSubmissionStatusV2 }, key: "WORKSPACE"
      end
    end
  end
end
