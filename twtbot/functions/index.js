/* eslint-disable */
const cron = require("node-cron");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Database reference
const dbRef = admin.firestore().doc("tokens/demo");

// Twitter API init
const TwitterApi = require("twitter-api-v2").default;
const twitterClient = new TwitterApi({
	clientId: "bUVrZHdIQXNxX2F3YXl3UlBnSlM6MTpjaQ",
	clientSecret: "K-A0iSEW5TEstu_bASP_YcexMzKYrUWoPHnWteB8t22a2v2PoN",
});

const callbackURL = "http://127.0.0.1:5000/twtbot-67923/us-central1/callback";
// OpenAI API init
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
	apiKey: "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",
});
const openai = new OpenAIApi(configuration);

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async (request, response) => {
	const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
		callbackURL,
		{ scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
	);

	// store verifier
	await dbRef.set({ codeVerifier, state });

	response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest(async (request, response) => {
	const { state, code } = request.query;

	const dbSnapshot = await dbRef.get();
	const { codeVerifier, state: storedState } = dbSnapshot.data();

	if (state !== storedState) {
		return response.status(400).send("Stored tokens do not match!");
	}

	const {
		client: loggedClient,
		accessToken,
		refreshToken,
	} = await twitterClient.loginWithOAuth2({
		code,
		codeVerifier,
		redirectUri: callbackURL,
	});

	await dbRef.set({ accessToken, refreshToken });

	const { data } = await loggedClient.v2.me();

	response.send(data);
});

// STEP 3 - Refresh tokens and post tweets
const tweet = async () => {
	try {
		const { refreshToken } = (await dbRef.get()).data();

		console.log("Refresh token from Firestore:", refreshToken);
		const {
			client: refreshedClient,
			accessToken,
			refreshToken: newRefreshToken,
		} = await twitterClient.refreshOAuth2Token(refreshToken);

		await dbRef.set({ accessToken, refreshToken: newRefreshToken });

		const nextTweet = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: "tweet something cool, intresting and unique for #techtwitter",
			max_tokens: 64,
		});

		const { data } = await refreshedClient.v2.tweet(
			nextTweet.data.choices[0].text
		);

		console.log("this is the data", data);
	} catch (error) {
		console.error("Error in tweet function:", error);
	}
};

// Schedule the tweet function to run every day at 6 pm
cron.schedule("0 */4 * * *", tweet);

// Export the tweet function as an HTTP endpoint for manual triggering if needed
exports.tweet = functions.https.onRequest(async (request, response) => {
	try {
		await tweet();
		response.send("Tweet successfully posted.");
	} catch (error) {
		console.error("Error in tweet function:", error);
		response.status(500).send("An error occurred: " + error.message);
	}
});
