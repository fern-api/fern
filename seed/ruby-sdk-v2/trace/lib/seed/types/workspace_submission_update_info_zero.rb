# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfoZero < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionUpdateInfoZeroType }, optional: false, nullable: false
      field :value, -> { Seed::Types::RunningSubmissionState }, optional: true, nullable: false
    end
  end
end
