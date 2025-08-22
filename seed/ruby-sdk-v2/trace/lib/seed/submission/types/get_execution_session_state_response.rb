# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class GetExecutionSessionStateResponse < Internal::Types::Model
        field :states, lambda {
          Internal::Types::Hash[String, Seed::Submission::Types::ExecutionSessionState]
        }, optional: false, nullable: false
        field :num_warming_instances, -> { Integer }, optional: true, nullable: false
        field :warming_session_ids, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
