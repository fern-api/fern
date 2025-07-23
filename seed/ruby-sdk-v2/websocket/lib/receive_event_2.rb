# frozen_string_literal: true

module Realtime
    module Types
        class ReceiveEvent2 < Internal::Types::Model
            field :gamma, String, optional: true, nullable: true
            field :delta, Integer, optional: true, nullable: true
            field :epsilon, Boolean, optional: true, nullable: true
        end
    end
end
