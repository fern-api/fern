# frozen_string_literal: true

module Submission
    module Types
        class TracedFile < Internal::Types::Model
            field :filename, String, optional: true, nullable: true
            field :directory, String, optional: true, nullable: true
        end
    end
end
