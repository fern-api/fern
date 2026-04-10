# frozen_string_literal: true

module Seed
  module Types
    class BuildingExecutorResponse < Internal::Types::Model
      field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      field :status, -> { Seed::Types::ExecutionSessionStatus }, optional: false, nullable: false
    end
  end
end
