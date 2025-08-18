# frozen_string_literal: true

module Seed
    module Types
        class SendEvent < Internal::Types::Model
            field :send_text, String, optional: false, nullable: false
            field :send_param, Integer, optional: false, nullable: false
        end
    end
end
