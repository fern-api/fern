# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfoZero < Internal::Types::Model
      field :type, -> { Seed::Types::TestSubmissionUpdateInfoZeroType }, optional: false, nullable: false
      field :value, -> { Seed::Types::RunningSubmissionState }, optional: true, nullable: false
    end
  end
end
