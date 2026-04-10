# frozen_string_literal: true

module Seed
  module Types
    class SubmissionResponseZero < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionResponseZeroType }, optional: false, nullable: false
    end
  end
end
