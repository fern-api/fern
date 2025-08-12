
module Seed
    module Types
        class ExecutionSessionState < Internal::Types::Model
            field :last_time_contacted, , optional: true, nullable: false
            field :session_id, , optional: false, nullable: false
            field :is_warm_instance, , optional: false, nullable: false
            field :aws_task_id, , optional: true, nullable: false
            field :language, , optional: false, nullable: false
            field :status, , optional: false, nullable: false
        end
    end
end
