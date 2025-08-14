# frozen_string_literal: true

module Seed
    module Types
        class Error < Internal::Types::Model
            field :category, Seed::Endpoints::Put::ErrorCategory, optional: false, nullable: false
            field :code, Seed::Endpoints::Put::ErrorCode, optional: false, nullable: false
            field :detail, String, optional: true, nullable: false
            field :field, String, optional: true, nullable: false

    end
end
