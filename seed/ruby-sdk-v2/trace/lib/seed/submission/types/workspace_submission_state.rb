# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceSubmissionState < Internal::Types::Model
        field :status, -> { Seed::Submission::Types::WorkspaceSubmissionStatus }, optional: false, nullable: false
      end
    end
  end
end
