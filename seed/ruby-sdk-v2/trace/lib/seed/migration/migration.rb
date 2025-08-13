
module Seed
    module Types
        class Migration < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :status, Seed::migration::MigrationStatus, optional: false, nullable: false

    end
end
