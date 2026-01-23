# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceRanResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :run_details, -> { FernTrace::Submission::Types::WorkspaceRunDetails }, optional: false, nullable: false, api_name: "runDetails"
      end
    end
  end
end
