# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionTypeState < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::TestSubmissionState }, key: "TEST"
        member -> { Seed::Submission::Types::WorkspaceSubmissionState }, key: "WORKSPACE"
      end
    end
  end
end
