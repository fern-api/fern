# frozen_string_literal: true

module Seed
    module Types
        class ErroredResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :error_info, Seed::Submission::ErrorInfo, optional: false, nullable: false

    end
end
