const questions = [
    {
        id: 1,
        question: "How long is your password?",
        options: ["Less than 8 characters", "8-12 characters", "More than 12 characters"],
        weights: [0, 5, 10]
    },
    {
        id: 2,
        question: "Do you use a mix of uppercase, lowercase, numbers, and symbols?",
        options: ["No, only letters/numbers", "Yes, some mixing", "Yes, all four types used"],
        weights: [0, 5, 10]
    },
    {
        id: 3,
        question: "Is this password used on other websites?",
        options: ["Yes, on many sites", "On 1-2 other sites", "No, it is unique"],
        weights: [0, 5, 10]
    },
    {
        id: 4,
        question: "Do you have Two-Factor Authentication (2FA) enabled?",
        options: ["No", "Yes, via SMS", "Yes, via Authenticator App"],
        weights: [0, 7, 10]
    },
    {
        id: 5,
        question: "When was the last time you changed this password?",
        options: ["More than a year ago", "In the last 6 months", "In the last month"],
        weights: [0, 5, 10]
    },
    {
        id: 6,
        question: "Does your password contain your name, birthdate, or pet's name?",
        options: ["Yes", "Maybe some public info", "No personal info used"],
        weights: [0, 5, 10]
    },
    {
        id: 7,
        question: "Where do you store your passwords?",
        options: ["In my head/browser", "In a notebook", "In a secure Password Manager"],
        weights: [0, 5, 10]
    },
    {
        id: 8,
        question: "Do you log into this app on public Wi-Fi?",
        options: ["Yes, always", "Sometimes", "Never/Only with VPN"],
        weights: [0, 5, 10]
    },
    {
        id: 9,
        question: "Have you ever shared this password with someone?",
        options: ["Yes", "Only with family", "Never"],
        weights: [0, 5, 10]
    },
    {
        id: 10,
        question: "Do you use common words like 'password' or '123456'?",
        options: ["Yes", "Partially", "No dictionary words"],
        weights: [0, 5, 10]
    }
];

module.exports = questions;
