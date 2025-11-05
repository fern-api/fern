# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceSubmitRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :language, -> { Seed::Commons::Types::Language }, optional: false, nullable: false
        field :submission_files, lambda {
          Internal::Types::Array[Seed::Submission::Types::SubmissionFileInfo]
        }, optional: false, nullable: false, api_name: "submissionFiles"
        field :user_id, -> { String }, optional: true, nullable: false, api_name: "userId"
      end
    end
  end
end
