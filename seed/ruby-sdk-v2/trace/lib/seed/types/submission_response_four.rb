# frozen_string_literal: true

module Seed
  module Types
    class SubmissionResponseFour < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionResponseFourType }, optional: false, nullable: false
      field :value, -> { Seed::Types::CodeExecutionUpdate }, optional: true, nullable: false
    end
  end
end
