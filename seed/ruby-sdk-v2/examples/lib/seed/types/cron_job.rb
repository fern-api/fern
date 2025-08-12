
module Seed
    module Types
        class CronJob < Internal::Types::Model
            field :expression, , optional: false, nullable: false
        end
    end
end
