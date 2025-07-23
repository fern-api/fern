# frozen_string_literal: true

module Submission
    module Types
        class ExecutionSessionState < Internal::Types::Model
            field :last_time_contacted, Array, optional: true, nullable: true
            field :session_id, String, optional: true, nullable: true
            field :is_warm_instance, Boolean, optional: true, nullable: true
            field :aws_task_id, Array, optional: true, nullable: true
            field :language, Language, optional: true, nullable: true
            field :status, ExecutionSessionStatus, optional: true, nullable: true
        end
    end
end
