# frozen_string_literal: true

module Seed
  module Types
    class SubmissionTypeStateZero < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionTypeStateZeroType }, optional: false, nullable: false
    end
  end
end
