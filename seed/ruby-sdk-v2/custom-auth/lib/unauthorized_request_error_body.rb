# frozen_string_literal: true

module Errors
    module Types
        class UnauthorizedRequestErrorBody < Internal::Types::Model
            field :message, String, optional: true, nullable: true
        end
    end
end
