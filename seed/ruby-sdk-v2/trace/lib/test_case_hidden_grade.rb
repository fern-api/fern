# frozen_string_literal: true

module Submission
    module Types
        class TestCaseHiddenGrade < Internal::Types::Model
            field :passed, Boolean, optional: true, nullable: true
        end
    end
end
