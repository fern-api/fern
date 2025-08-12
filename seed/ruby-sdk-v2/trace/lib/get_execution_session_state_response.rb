# frozen_string_literal: true

module Submission
    module Types
        class GetExecutionSessionStateResponse < Internal::Types::Model
            field :states, Array, optional: true, nullable: true
            field :num_warming_instances, Array, optional: true, nullable: true
            field :warming_session_ids, Array, optional: true, nullable: true
        end
    end
end
