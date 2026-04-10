# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceRanResponse < Internal::Types::Model
      field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      field :run_details, -> { Seed::Types::WorkspaceRunDetails }, optional: false, nullable: false, api_name: "runDetails"
    end
  end
end
