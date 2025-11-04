# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class CustomTestCasesUnsupported < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      end
    end
  end
end
