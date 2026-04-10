# frozen_string_literal: true

module Seed
  module Admin
    module Types
      class AdminStoreTracedWorkspaceRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :workspace_run_details, -> { Seed::Types::WorkspaceRunDetails }, optional: false, nullable: false, api_name: "workspaceRunDetails"
        field :trace_responses, -> { Internal::Types::Array[Seed::Types::TraceResponse] }, optional: false, nullable: false, api_name: "traceResponses"
      end
    end
  end
end
