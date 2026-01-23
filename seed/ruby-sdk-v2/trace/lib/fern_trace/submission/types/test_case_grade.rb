# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TestCaseGrade < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::TestCaseHiddenGrade }, key: "HIDDEN"
        member -> { FernTrace::Submission::Types::TestCaseNonHiddenGrade }, key: "NON_HIDDEN"
      end
    end
  end
end
