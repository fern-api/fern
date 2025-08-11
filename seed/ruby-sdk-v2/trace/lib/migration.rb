# frozen_string_literal: true

module Migration
    module Types
        class Migration < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :status, MigrationStatus, optional: true, nullable: true
        end
    end
end
