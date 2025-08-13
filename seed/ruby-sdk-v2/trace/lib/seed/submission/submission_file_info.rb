# frozen_string_literal: true

module Seed
    module Types
        class SubmissionFileInfo < Internal::Types::Model
            field :directory, String, optional: false, nullable: false
            field :filename, String, optional: false, nullable: false
            field :contents, String, optional: false, nullable: false

    end
end
