# frozen_string_literal: true

module Seed
  module LangServer
    module Types
      class LangServerResponse < Internal::Types::Model
        field :response, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
      end
    end
  end
end
