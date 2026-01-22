# frozen_string_literal: true

module FernTrace
  module Admin
    module Types
      class StoreTracedWorkspaceRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :workspace_run_details, -> { FernTrace::Submission::Types::WorkspaceRunDetails }, optional: false, nullable: false, api_name: "workspaceRunDetails"
        field :trace_responses, -> { Internal::Types::Array[FernTrace::Submission::Types::TraceResponse] }, optional: false, nullable: false, api_name: "traceResponses"
      end
    end
  end
end
