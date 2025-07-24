# frozen_string_literal: true

module GeneralErrors
    module Types
        class BadObjectRequestInfo < Internal::Types::Model
            field :message, String, optional: true, nullable: true
        end
    end
end
