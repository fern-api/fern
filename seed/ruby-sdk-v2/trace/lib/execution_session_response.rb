# frozen_string_literal: true

module Submission
    module Types
        class ExecutionSessionResponse < Internal::Types::Model
            field :session_id, String, optional: true, nullable: true
            field :execution_session_url, Array, optional: true, nullable: true
            field :language, Language, optional: true, nullable: true
            field :status, ExecutionSessionStatus, optional: true, nullable: true
        end
    end
end
