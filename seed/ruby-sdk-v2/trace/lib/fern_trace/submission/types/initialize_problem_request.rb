# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class InitializeProblemRequest < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :problem_version, -> { Integer }, optional: true, nullable: false, api_name: "problemVersion"
      end
    end
  end
end
