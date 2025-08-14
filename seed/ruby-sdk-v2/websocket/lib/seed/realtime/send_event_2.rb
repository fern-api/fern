# frozen_string_literal: true

module Seed
    module Types
        class SendEvent2 < Internal::Types::Model
            field :send_text_2, String, optional: false, nullable: false
            field :send_param_2, Internal::Types::Boolean, optional: false, nullable: false

    end
end
