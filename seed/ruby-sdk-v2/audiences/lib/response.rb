# frozen_string_literal: true

module FolderD
    module Types
        class Response < Internal::Types::Model
            field :foo, String, optional: true, nullable: true
        end
    end
end
