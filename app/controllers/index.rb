require 'twilio-ruby'
require 'debugger'

get '/' do
  erb :index
end

get '/set_info' do
  session[:phone] = params[:phonenum]
  content_type :json
  {phonenum: params[:phonenum], stopaddress: params[:stopaddress]}.to_json
end

post '/stop_approaching' do
  client = Twilio::REST::Client.new APP_CONFIG[:account_sid], APP_CONFIG[:auth_token]
  client.account.messages.create(
    from: APP_CONFIG[:twilio_phone],
    to: "+"+session[:phone],
    body: "Your stop is coming up. Get ready!"
    )
end