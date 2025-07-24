# frozen_string_literal: true

module Realtime
    module Types
        class ReceiveEvent < Internal::Types::Model
            field :alpha, String, optional: true, nullable: true
            field :beta, Integer, optional: true, nullable: true
        end
    end
end
