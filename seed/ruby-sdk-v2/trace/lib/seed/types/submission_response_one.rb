# frozen_string_literal: true

module Seed
  module Types
    class SubmissionResponseOne < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionResponseOneType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
