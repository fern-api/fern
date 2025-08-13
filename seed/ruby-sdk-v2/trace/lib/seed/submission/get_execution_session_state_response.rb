
module Seed
    module Types
        class GetExecutionSessionStateResponse < Internal::Types::Model
            field :states, Internal::Types::Hash[String, Seed::submission::ExecutionSessionState], optional: false, nullable: false
            field :num_warming_instances, Integer, optional: true, nullable: false
            field :warming_session_ids, Internal::Types::Array[String], optional: false, nullable: false

    end
end
