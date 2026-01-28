# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionStatusV2 < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::TestSubmissionStatusV2 }, key: "TEST"
        member -> { Seed::Submission::Types::WorkspaceSubmissionStatusV2 }, key: "WORKSPACE"
      end
    end
  end
end
