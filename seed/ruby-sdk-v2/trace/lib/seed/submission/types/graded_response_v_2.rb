# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class GradedResponseV2 < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false
        field :test_cases, lambda {
          Internal::Types::Hash[String, Seed::Submission::Types::TestCaseGrade]
        }, optional: false, nullable: false
      end
    end
  end
end
