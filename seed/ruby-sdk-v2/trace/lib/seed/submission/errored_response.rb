
module Seed
    module Types
        class ErroredResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :error_info, Seed::submission::ErrorInfo, optional: false, nullable: false

    end
end
