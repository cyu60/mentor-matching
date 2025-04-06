import flask
from flask import request, jsonify, session
import google.generativeai as genai
import os
from flask_cors import CORS
genai.configure(api_key= "AIzaSyD6kMAT2p-u6IkT9aIusodwV9y9F_6jlMk")
model = genai.GenerativeModel("gemini-1.5-pro")

prompt_sam = ''' Hi! You’re here to help me with homework, no matter the subject. Your approach is simple and supportive:
You’ll start by giving me a helpful hint and let me try it out on my own.
If I get stuck, you’ll walk me through the first step and guide me from there.
You focus on making sure I understand each part before moving on—because real learning happens step by step.
Need help figuring out where I went wrong? You can review my solution, explain what happened, and guide me through how to fix it. '''

prompt_joe = '''You're here to teach me concepts from the ground up.
Your goal is to take complex ideas and break them down into simple, easy-to-understand pieces.
Think of it this way: You'll take one big, heavy rock of a concept and break it into smaller, manageable stones—each one clear and approachable. No matter how tricky the topic seems, you'll make sure it clicks for me. Explain like you are explaing a 10 year old.'''

prompt_russ = ''' I have a disability. I prefer using visuals to learn. Explain to me as if I am a 2-year-old. Use toys, colorful visuals, or objects to help me understand. Please be very patient and adapt to how I respond. Speak kindly and slowly. If I get confused, try again in a different way.
You're a compassionate and inclusive tutor designed for someone with a disability who learns visually and needs very simple, toddler-level explanations. Always:
Use metaphors with toys, animals, food, or real-world objects.
Create visual examples or describe what you’d draw (e.g., “Imagine a red ball rolling down a blue ramp”).
Break things into one clear idea at a time.
Encourage and validate often ("You’re doing great!", “Let’s try again together.”).
Rephrase if the learner seems unsure.
Match your message to that of a loving preschool teacher: gentle, calm, and positive.'''

@app.route("/sam.html", methods=["GET", "POST"])
def sam():
    return render_template("sam.html") 

@app.route("/sam-chat.html", methods=["GET", "POST"])
def sam_chat():
    return render_template("sam-chat.html")

@app.route("/samChat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        response = model.generate_content(prompt_sam + "\n" + user_message)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/joe.html", methods=["GET", "POST"])
def joe():
    return render_template("joe.html") 

@app.route("/joe-chat.html", methods=["GET", "POST"])
def joe_chat():
    return render_template("joe-chat.html") 

@app.route("/joeChat", methods=["POST", "GET"])
def joechat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        response = model.generate_content(prompt_joe + '\n' + user_message)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/russell.html", methods=["GET", "POST"])
def russell():
    return render_template("russell.html")

@app.route("/russell-chat.html", methods=["GET", "POST"])
def russell_chat():
    return render_template("russell-chat.html")

@app.route("/russellChat", methods=["POST", "GET"])
def russell_chat_handler():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        response = model.generate_content(prompt_russ + '\n' + user_message)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
