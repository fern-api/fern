# frozen_string_literal: true

module Seed
  module V2V3Problem
    module Types
      class V2V3ProblemGetProblemVersionRequest < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
      end
    end
  end
end
