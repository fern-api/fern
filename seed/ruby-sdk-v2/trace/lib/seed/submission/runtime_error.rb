# frozen_string_literal: true

module Seed
    module Types
        class RuntimeError < Internal::Types::Model
            field :message, String, optional: false, nullable: false

    end
end
