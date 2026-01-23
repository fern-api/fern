# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceSubmissionUpdate < Internal::Types::Model
        field :update_time, -> { String }, optional: false, nullable: false, api_name: "updateTime"
        field :update_info, -> { FernTrace::Submission::Types::WorkspaceSubmissionUpdateInfo }, optional: false, nullable: false, api_name: "updateInfo"
      end
    end
  end
end
