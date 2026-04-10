# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionStatusTestCaseIDToState < Internal::Types::Model
      field :value, -> { Internal::Types::Hash[String, Seed::Types::SubmissionStatusForTestCase] }, optional: true, nullable: false
    end
  end
end
