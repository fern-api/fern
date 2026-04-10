# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfo < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoZero }
      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoOne }
      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoTwo }
      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoThree }
      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoFour }
      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoFive }
      member -> { Seed::Types::WorkspaceSubmissionUpdateInfoType }
    end
  end
end
