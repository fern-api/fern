# frozen_string_literal: true

module LangServer
    module Types
        class LangServerResponse < Internal::Types::Model
            field :response, Object, optional: true, nullable: true
        end
    end
end
