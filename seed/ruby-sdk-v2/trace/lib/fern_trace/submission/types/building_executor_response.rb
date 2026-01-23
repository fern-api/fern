# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class BuildingExecutorResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :status, -> { FernTrace::Submission::Types::ExecutionSessionStatus }, optional: false, nullable: false
      end
    end
  end
end
