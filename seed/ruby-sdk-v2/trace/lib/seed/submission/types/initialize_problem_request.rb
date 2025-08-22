# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class InitializeProblemRequest < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false
        field :problem_version, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
