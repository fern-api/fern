
module Seed
    module Types
        class CronJob < Internal::Types::Model
            field :expression, String, optional: false, nullable: false
        end
    end
end
