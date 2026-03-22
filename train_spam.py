import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle

# 1. SAMPLE DATA (For a B.Tech Demo)
# We can use a larger dataset like 'SMSSpamCollection' later.
data = {
    'text': [
        "Congratulations! You've won a $1000 gift card. Call now to claim your prize.",
        "Your account has been suspended. Please click here to verify your details.",
        "URGENT: Your parcel is stuck at customs. Pay $2.99 to release it.",
        "Hi, how are you? Are we still meeting for lunch today?",
        "Hey, could you send me the report by 5 PM?",
        "Your Amazon order has been shipped and will arrive tomorrow.",
        "FINAL NOTICE: You owe $500 in taxes. Pay via bitcoin to avoid arrest.",
        "Don't forget the meeting scheduled for tomorrow morning.",
        "Get rich quick! Trade in forex and double your money in 2 days.",
        "Hi Mom, I'll be home late tonight. Don't worry about dinner."
    ],
    'label': [1, 1, 1, 0, 0, 0, 1, 0, 1, 0] # 1 for SPAM, 0 for HAM/SAFE
}

df = pd.DataFrame(data)

# 2. VECTORIZATION (Turning words into numbers)
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df['text'])
y = df['label']

# 3. MODEL TRAINING (The Brain)
model = MultinomialNB()
model.fit(X, y)

# 4. SAVING THE MODEL (For reuse)
with open('spam_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)

print("AI Model Trained & Saved Successfully as 'spam_model.pkl'!")
