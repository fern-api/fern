# frozen_string_literal: true

module Endpoints
    module Types
        class Error < Internal::Types::Model
            field :category, ErrorCategory, optional: true, nullable: true
            field :code, ErrorCode, optional: true, nullable: true
            field :detail, Array, optional: true, nullable: true
            field :field, Array, optional: true, nullable: true
        end
    end
end
