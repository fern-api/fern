# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionStatus < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::WorkspaceSubmissionStatusZero }
      member -> { Seed::Types::WorkspaceSubmissionStatusOne }
      member -> { Seed::Types::WorkspaceSubmissionStatusType }
      member -> { Seed::Types::WorkspaceSubmissionStatusThree }
      member -> { Seed::Types::WorkspaceSubmissionStatusFour }
    end
  end
end
