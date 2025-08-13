# frozen_string_literal: true

module Seed
    module Types
        class Migration < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :status, Seed::Types::MigrationStatus, optional: false, nullable: false

    end
end
