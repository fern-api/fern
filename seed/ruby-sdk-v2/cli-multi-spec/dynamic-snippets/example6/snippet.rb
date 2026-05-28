require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.get_invoice(invoice_id: "invoiceId")
