
module Seed
    module Types
        class LangServerResponse < Internal::Types::Model
            field :response, Internal::Types::Hash[String, ], optional: false, nullable: false
        end
    end
end
