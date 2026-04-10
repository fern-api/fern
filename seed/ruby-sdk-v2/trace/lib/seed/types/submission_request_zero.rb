# frozen_string_literal: true

module Seed
  module Types
    class SubmissionRequestZero < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionRequestZeroType }, optional: false, nullable: false
    end
  end
end
