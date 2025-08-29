# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class FinishedResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
