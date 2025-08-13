
module Seed
    module Types
        class ExecutionSessionResponse < Internal::Types::Model
            field :session_id, String, optional: false, nullable: false
            field :execution_session_url, String, optional: true, nullable: false
            field :language, Seed::commons::Language, optional: false, nullable: false
            field :status, Seed::submission::ExecutionSessionStatus, optional: false, nullable: false
        end
    end
end
