
module Seed
    module Types
        class ExecutionSessionResponse < Internal::Types::Model
            field :session_id, , optional: false, nullable: false
            field :execution_session_url, , optional: true, nullable: false
            field :language, , optional: false, nullable: false
            field :status, , optional: false, nullable: false
        end
    end
end
