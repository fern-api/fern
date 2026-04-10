# frozen_string_literal: true

module Seed
  module Admin
    module Types
      class AdminSendWorkspaceSubmissionUpdateRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :body, -> { Seed::Types::WorkspaceSubmissionUpdate }, optional: false, nullable: false
      end
    end
  end
end
