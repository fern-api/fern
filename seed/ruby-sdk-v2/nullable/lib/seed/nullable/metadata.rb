
module Seed
    module Types
        class Metadata < Internal::Types::Model
            field :created_at, String, optional: false, nullable: false
            field :updated_at, String, optional: false, nullable: false
            field :avatar, String, optional: false, nullable: true
            field :activated, Internal::Types::Boolean, optional: true, nullable: false
            field :status, Seed::nullable::Status, optional: false, nullable: false
            field :values, Internal::Types::Hash[String, String], optional: true, nullable: false

    end
end
