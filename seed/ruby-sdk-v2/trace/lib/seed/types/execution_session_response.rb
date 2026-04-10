# frozen_string_literal: true

module Seed
  module Types
    class ExecutionSessionResponse < Internal::Types::Model
      field :session_id, -> { String }, optional: false, nullable: false, api_name: "sessionId"
      field :execution_session_url, -> { String }, optional: true, nullable: false, api_name: "executionSessionUrl"
      field :language, -> { Seed::Types::Language }, optional: false, nullable: false
      field :status, -> { Seed::Types::ExecutionSessionStatus }, optional: false, nullable: false
    end
  end
end
