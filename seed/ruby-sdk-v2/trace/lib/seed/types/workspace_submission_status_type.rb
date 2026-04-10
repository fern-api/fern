# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionStatusType < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionStatusTypeType }, optional: false, nullable: false
      field :value, -> { Seed::Types::RunningSubmissionState }, optional: true, nullable: false
    end
  end
end
