# frozen_string_literal: true

require_relative "../.."

module Seed
  module Submission
    module Types
      class SubmissionFileInfo < Internal::Types::Model
        field :directory, -> { String }, optional: false, nullable: false

        field :filename, -> { String }, optional: false, nullable: false

        field :contents, -> { String }, optional: false, nullable: false
      end
    end
  end
end
