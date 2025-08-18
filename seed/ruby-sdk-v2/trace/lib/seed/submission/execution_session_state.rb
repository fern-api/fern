# frozen_string_literal: true

module Seed
    module Types
        class ExecutionSessionState < Internal::Types::Model
            field :last_time_contacted, String, optional: true, nullable: false
            field :session_id, String, optional: false, nullable: false
            field :is_warm_instance, Internal::Types::Boolean, optional: false, nullable: false
            field :aws_task_id, String, optional: true, nullable: false
            field :language, Seed::Commons::Language, optional: false, nullable: false
            field :status, Seed::Submission::ExecutionSessionStatus, optional: false, nullable: false

    end
end
