# frozen_string_literal: true

module Seed
    module Types
        class TestCaseGrade < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::TestCaseHiddenGrade }, key: "HIDDEN"
            member -> { Seed::Submission::TestCaseNonHiddenGrade }, key: "NON_HIDDEN"
    end
end
