# Pubsub.io transport documentation
*draft 0*

# prerequisites

All low level transports to the server are using the [websocket protocol](http://en.wikipedia.org/wiki/WebSockets)
All websocket messages in pubsub consists entirely of JSON.

# handshake

The first message after connecting is a handshake.
As each connection is currently bound to a specific `subhub` it needs to be specified here. 

	{sub:name_of_subhub}

# subscribe / unsubscribe

If you want to subscribe to a query you send the following message:

	{name:'subscribe', query:your_query, challenge:your_auth_challenge, id:your_own_subscription_id}

where `challenge` is optional.
The `id` is your own id for this subscription. The hub will notify you whenever your subscription is matched by sending the following message:

	{name:'publish', doc:the_matches_document, id:your_subscription_id}
	
To unsubscribe you send the following message:

	{name:'unsubscribe', id:_your_subscription_id}
	
# publish

To publish a document just send the following message:

	{name:'publish', doc:your_document}