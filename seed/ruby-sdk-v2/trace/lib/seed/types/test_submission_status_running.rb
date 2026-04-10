# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionStatusRunning < Internal::Types::Model
      field :value, -> { Seed::Types::RunningSubmissionState }, optional: true, nullable: false
    end
  end
end
