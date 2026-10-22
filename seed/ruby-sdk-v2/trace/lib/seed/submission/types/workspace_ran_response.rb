# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Submission
    module Types
      class WorkspaceRanResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"

        field :run_details, -> { Seed::Submission::Types::WorkspaceRunDetails }, optional: false, nullable: false, api_name: "runDetails"
      end
    end
  end
end
