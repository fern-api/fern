# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Submission
    module Types
      class StderrResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"

        field :stderr, -> { String }, optional: false, nullable: false
      end
    end
  end
end
