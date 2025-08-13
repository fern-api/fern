# frozen_string_literal: true

module Seed
    module Types
        class Metadata < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :data, Internal::Types::Hash[String, String], optional: true, nullable: false

    end
end
