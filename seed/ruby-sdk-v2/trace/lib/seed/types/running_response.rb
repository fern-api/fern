# frozen_string_literal: true

module Seed
  module Types
    class RunningResponse < Internal::Types::Model
      field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      field :state, -> { Seed::Types::RunningSubmissionState }, optional: false, nullable: false
    end
  end
end
