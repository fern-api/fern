
module Seed
    module Types
        class Error < Internal::Types::Model
            field :category, Seed::endpoints::put::ErrorCategory, optional: false, nullable: false
            field :code, Seed::endpoints::put::ErrorCode, optional: false, nullable: false
            field :detail, String, optional: true, nullable: false
            field :field, String, optional: true, nullable: false
        end
    end
end
