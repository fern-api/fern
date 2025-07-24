# frozen_string_literal: true

module Submission
    module Types
        class TestCaseNonHiddenGrade < Internal::Types::Model
            field :passed, Boolean, optional: true, nullable: true
            field :actual_result, Array, optional: true, nullable: true
            field :exception, Array, optional: true, nullable: true
            field :stdout, String, optional: true, nullable: true
        end
    end
end
