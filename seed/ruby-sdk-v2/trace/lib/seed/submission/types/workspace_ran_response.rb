# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceRanResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false
        field :run_details, -> { Seed::Submission::Types::WorkspaceRunDetails }, optional: false, nullable: false
      end
    end
  end
end
