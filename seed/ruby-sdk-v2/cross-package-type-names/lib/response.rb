# frozen_string_literal: true

module FolderD
    module Types
        class Response < Internal::Types::Model
            field :foo, Array, optional: true, nullable: true
        end
    end
end
