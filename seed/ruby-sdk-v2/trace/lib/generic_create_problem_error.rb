# frozen_string_literal: true

module Problem
    module Types
        class GenericCreateProblemError < Internal::Types::Model
            field :message, String, optional: true, nullable: true
            field :type, String, optional: true, nullable: true
            field :stacktrace, String, optional: true, nullable: true
        end
    end
end
