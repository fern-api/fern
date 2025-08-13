# frozen_string_literal: true

module Seed
    module Types
        class TestCaseResultWithStdout < Internal::Types::Model
            field :result, Seed::Submission::TestCaseResult, optional: false, nullable: false
            field :stdout, String, optional: false, nullable: false

    end
end
