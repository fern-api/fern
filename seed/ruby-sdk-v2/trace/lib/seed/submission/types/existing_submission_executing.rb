# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ExistingSubmissionExecuting < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      end
    end
  end
end
