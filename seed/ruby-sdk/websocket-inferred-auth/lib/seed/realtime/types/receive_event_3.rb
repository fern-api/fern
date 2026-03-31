# frozen_string_literal: true

module Seed
  module Realtime
    module Types
      class ReceiveEvent3 < Internal::Types::Model
        field :receive_text_3, -> { String }, optional: false, nullable: false, api_name: "receiveText3"
      end
    end
  end
end
