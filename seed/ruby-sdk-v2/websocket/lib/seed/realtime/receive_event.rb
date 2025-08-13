# frozen_string_literal: true

module Seed
    module Types
        class ReceiveEvent < Internal::Types::Model
            field :alpha, String, optional: false, nullable: false
            field :beta, Integer, optional: false, nullable: false

    end
end
