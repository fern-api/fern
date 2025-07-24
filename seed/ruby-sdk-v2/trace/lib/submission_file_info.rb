# frozen_string_literal: true

module Submission
    module Types
        class SubmissionFileInfo < Internal::Types::Model
            field :directory, String, optional: true, nullable: true
            field :filename, String, optional: true, nullable: true
            field :contents, String, optional: true, nullable: true
        end
    end
end
