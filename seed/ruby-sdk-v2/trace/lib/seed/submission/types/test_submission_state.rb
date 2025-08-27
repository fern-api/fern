# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestSubmissionState < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false
        field :default_test_cases, lambda {
          Internal::Types::Array[Seed::Commons::Types::TestCase]
        }, optional: false, nullable: false
        field :custom_test_cases, lambda {
          Internal::Types::Array[Seed::Commons::Types::TestCase]
        }, optional: false, nullable: false
        field :status, -> { Seed::Submission::Types::TestSubmissionStatus }, optional: false, nullable: false
      end
    end
  end
end
