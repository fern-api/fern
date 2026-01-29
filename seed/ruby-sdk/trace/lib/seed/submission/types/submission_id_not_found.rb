# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionIdNotFound < Internal::Types::Model
        field :missing_submission_id, -> { String }, optional: false, nullable: false, api_name: "missingSubmissionId"
      end
    end
  end
end
