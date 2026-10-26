# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Realtime
    module Types
      class ReceiveEvent3 < Internal::Types::Model
        field :receive_text3, -> { String }, optional: false, nullable: false, api_name: "receiveText3"
      end
    end
  end
end
