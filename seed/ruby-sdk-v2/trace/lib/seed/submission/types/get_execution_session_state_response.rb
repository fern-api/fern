# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class GetExecutionSessionStateResponse < Internal::Types::Model
        field :states, lambda {
          Internal::Types::Hash[String, Seed::Submission::Types::ExecutionSessionState]
        }, optional: false, nullable: false
        field :num_warming_instances, -> { Integer }, optional: true, nullable: false, api_name: "numWarmingInstances"
        field :warming_session_ids, lambda {
          Internal::Types::Array[String]
        }, optional: false, nullable: false, api_name: "warmingSessionIds"
      end
    end
  end
end
