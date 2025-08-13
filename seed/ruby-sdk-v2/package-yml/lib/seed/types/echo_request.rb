# frozen_string_literal: true

module Seed
    module Types
        class EchoRequest < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :size, Integer, optional: false, nullable: false

    end
end
