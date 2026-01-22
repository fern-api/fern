# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceSubmitRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :language, -> { FernTrace::Commons::Types::Language }, optional: false, nullable: false
        field :submission_files, -> { Internal::Types::Array[FernTrace::Submission::Types::SubmissionFileInfo] }, optional: false, nullable: false, api_name: "submissionFiles"
        field :user_id, -> { String }, optional: true, nullable: false, api_name: "userId"
      end
    end
  end
end
