# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class ExecutionSessionResponse < Internal::Types::Model
        field :session_id, -> { String }, optional: false, nullable: false, api_name: "sessionId"
        field :execution_session_url, -> { String }, optional: true, nullable: false, api_name: "executionSessionUrl"
        field :language, -> { FernTrace::Commons::Types::Language }, optional: false, nullable: false
        field :status, -> { FernTrace::Submission::Types::ExecutionSessionStatus }, optional: false, nullable: false
      end
    end
  end
end
