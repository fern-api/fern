# frozen_string_literal: true

module Seed
  module Admin
    module Types
      class StoreTracedWorkspaceRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false
        field :workspace_run_details, lambda {
          Seed::Submission::Types::WorkspaceRunDetails
        }, optional: false, nullable: false
        field :trace_responses, lambda {
          Internal::Types::Array[Seed::Submission::Types::TraceResponse]
        }, optional: false, nullable: false
      end
    end
  end
end
