# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestCaseResultWithStdout < Internal::Types::Model
        field :result, -> { Seed::Submission::Types::TestCaseResult }, optional: false, nullable: false
        field :stdout, -> { String }, optional: false, nullable: false
      end
    end
  end
end
