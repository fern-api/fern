# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class StdoutResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :stdout, -> { String }, optional: false, nullable: false
      end
    end
  end
end
