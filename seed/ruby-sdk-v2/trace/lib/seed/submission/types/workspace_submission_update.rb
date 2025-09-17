# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceSubmissionUpdate < Internal::Types::Model
        field :update_time, -> { String }, optional: false, nullable: false
        field :update_info, lambda {
          Seed::Submission::Types::WorkspaceSubmissionUpdateInfo
        }, optional: false, nullable: false
      end
    end
  end
end
