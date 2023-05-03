// const ACCESS_TOKEN = "2576194928-iYyNcNbLn2bT4Lg73IZSwsBkEdAP02jjIHhv0M8"
// const ACCSS_TOKEN_SECRET = "7UCaWJkYzYyUkfGX3klTLwDDyB9cQbQkennXrEIwqmca1"

// const API_KEY = "0e2ywzqAZEKp0QCv0ueHXB2VM"
// const API_KEY_SECRET = "SbfYcUUf3IYJjbZ9iREeSdk9sZM4kOt0fTdJZoWCNml0BTEPd9"

// const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAACRimwEAAAAAr3kVr6a%2BbO6wN%2FIy%2FT0TTJGaIP0%3DcbpDmicCu3juYK8G5n43iVUUrG7oVagK4A99HScK9Iu9pUFNRR"

// clientId: "bUVrZHdIQXNxX2F3YXl3UlBnSlM6MTpjaQ",
//   clientSecret: "M1p_5kHgBLVOCQlnjaLA0j-FkAy6HNZtk9Tk4qt3pAmkk835ON",

// const callbackURL = "http://localhost:5000/twtbot-67923/us-central1/callback";
    

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

async function createCompletion() {
  const response = await openai.createCompletion({
    model: "text-davinci-001",
    prompt: "Say this is a test",
    temperature: 0,
    max_tokens: 7,
  });
  console.log(response);
}

createCompletion();
